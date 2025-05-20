import { Router } from 'express';
import { isAuthenticated } from '../auth';
import * as paymentService from '../services/paymentService';
import { db } from '../db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // Type casting to fix compatibility issue
});

// Validation schemas
const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('usd'),
  description: z.string().optional(),
  serviceId: z.number().optional(),
  metadata: z.record(z.string()).optional(),
});

const createSubscriptionSchema = z.object({
  priceId: z.string(),
  metadata: z.record(z.string()).optional(),
});

const billingInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().default('US'),
  paymentMethodId: z.string().optional(),
});

// Create or update billing information
router.post('/billing-info', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const validated = billingInfoSchema.parse(req.body);
    
    // Check if billing info already exists for this user
    const existingBillingInfo = await db.select()
      .from(schema.billingInfo)
      .where(eq(schema.billingInfo.userId, userId))
      .limit(1);
      
    if (existingBillingInfo.length > 0) {
      // Update existing billing info
      const [updatedBillingInfo] = await db.update(schema.billingInfo)
        .set({
          ...validated,
          updatedAt: new Date()
        })
        .where(eq(schema.billingInfo.id, existingBillingInfo[0].id))
        .returning();
        
      return res.json(updatedBillingInfo);
    }
    
    // Create new billing info
    const [newBillingInfo] = await db.insert(schema.billingInfo)
      .values({
        userId,
        ...validated,
      })
      .returning();
      
    res.status(201).json(newBillingInfo);
  } catch (error) {
    console.error('Failed to save billing information:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to save billing information' });
  }
});

// Get current user's billing information
router.get('/billing-info', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const billingInfo = await db.select()
      .from(schema.billingInfo)
      .where(eq(schema.billingInfo.userId, userId));
      
    if (billingInfo.length === 0) {
      return res.status(404).json({ message: 'No billing information found' });
    }
    
    res.json(billingInfo[0]);
  } catch (error) {
    console.error('Failed to retrieve billing information:', error);
    res.status(500).json({ message: 'Failed to retrieve billing information' });
  }
});

// Create a payment intent for one-time payment
router.post('/create-payment-intent', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const validated = createPaymentIntentSchema.parse(req.body);
    
    // Get or create Stripe customer
    const user = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1)
      .then(users => users[0]);
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const customerId = await paymentService.getOrCreateStripeCustomer(
      userId, 
      user.email, 
      user.fullName
    );
    
    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      validated.amount,
      validated.currency,
      customerId,
      validated.metadata || {}
    );
    
    // Record transaction
    await paymentService.recordTransaction(
      userId,
      validated.amount,
      'one_time_payment',
      'pending',
      paymentIntent.id,
      undefined,
      validated.serviceId,
      validated.description
    );
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Create a subscription
router.post('/create-subscription', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const validated = createSubscriptionSchema.parse(req.body);
    
    // Get or create Stripe customer
    const user = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1)
      .then(users => users[0]);
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const customerId = await paymentService.getOrCreateStripeCustomer(
      userId, 
      user.email, 
      user.fullName
    );
    
    // Create subscription
    const subscription = await paymentService.createSubscription(
      customerId,
      validated.priceId,
      validated.metadata || {}
    );
    
    // Get the payment intent from the subscription
    const paymentIntentId = subscription.latest_invoice?.payment_intent?.id;
    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
    
    if (paymentIntentId) {
      // Record transaction
      await paymentService.recordTransaction(
        userId,
        0, // Amount will be updated when webhook receives the payment success
        'subscription',
        'pending',
        paymentIntentId,
        subscription.id
      );
      
      // Mark user as having a subscription (status will be updated by webhook)
      await db.update(schema.users)
        .set({ 
          membershipLevel: 'gold',
          membershipExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now, will be updated by webhook
        })
        .where(eq(schema.users.id, userId));
    }
    
    res.json({
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status
    });
  } catch (error) {
    console.error('Failed to create subscription:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

// Get payment methods for user
router.get('/payment-methods', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get Stripe customer
    const user = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1)
      .then(users => users[0]);
      
    if (!user?.stripeCustomerId) {
      return res.status(404).json({ message: 'No payment methods found' });
    }
    
    // Get payment methods
    const paymentMethods = await paymentService.listPaymentMethods(user.stripeCustomerId);
    
    // Format response
    const formattedPaymentMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      } : undefined,
      billingDetails: pm.billing_details
    }));
    
    res.json(formattedPaymentMethods);
  } catch (error) {
    console.error('Failed to retrieve payment methods:', error);
    res.status(500).json({ message: 'Failed to retrieve payment methods' });
  }
});

// Delete a payment method
router.delete('/payment-methods/:id', isAuthenticated, async (req, res) => {
  try {
    const paymentMethodId = req.params.id;
    
    // Delete payment method
    await paymentService.deletePaymentMethod(paymentMethodId);
    
    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Failed to delete payment method:', error);
    res.status(500).json({ message: 'Failed to delete payment method' });
  }
});

// Get transaction history
router.get('/transactions', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transactions = await db.select()
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, userId))
      .orderBy(schema.transactions.createdAt, 'desc');
      
    res.json(transactions);
  } catch (error) {
    console.error('Failed to retrieve transactions:', error);
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
});

// Webhook for Stripe events
// This endpoint should be public and process Stripe webhook events
router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ message: 'Missing signature or webhook secret' });
  }
  
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
});

// Helper functions for webhook handling
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find transaction by payment intent ID
    const [transaction] = await db.select()
      .from(schema.transactions)
      .where(eq(schema.transactions.stripePaymentIntentId, paymentIntent.id))
      .limit(1);
      
    if (!transaction) {
      console.error('Transaction not found for payment intent:', paymentIntent.id);
      return;
    }
    
    // Update transaction status
    await paymentService.updateTransactionStatus(transaction.id, 'completed');
    
    // If it's a one-time payment for a service, update service status
    if (transaction.serviceId && transaction.transactionType === 'one_time_payment') {
      await db.update(schema.serviceRequests)
        .set({ status: 'paid' })
        .where(eq(schema.serviceRequests.id, transaction.serviceId));
    }
    
    // Create notification for user
    await db.insert(schema.notifications)
      .values({
        userId: transaction.userId,
        title: 'Payment Successful',
        message: `Your payment of $${(transaction.amount / 100).toFixed(2)} has been processed successfully.`,
        type: 'Update'
      });
  } catch (error) {
    console.error('Error handling successful payment intent:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find transaction by payment intent ID
    const [transaction] = await db.select()
      .from(schema.transactions)
      .where(eq(schema.transactions.stripePaymentIntentId, paymentIntent.id))
      .limit(1);
      
    if (!transaction) {
      console.error('Transaction not found for payment intent:', paymentIntent.id);
      return;
    }
    
    // Update transaction status
    await paymentService.updateTransactionStatus(transaction.id, 'failed');
    
    // Create notification for user
    await db.insert(schema.notifications)
      .values({
        userId: transaction.userId,
        title: 'Payment Failed',
        message: `Your payment of $${(transaction.amount / 100).toFixed(2)} could not be processed. Please check your payment details.`,
        type: 'Alert'
      });
  } catch (error) {
    console.error('Error handling failed payment intent:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription || !invoice.customer) return;
    
    // Find user by Stripe customer ID
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.stripeCustomerId, invoice.customer as string))
      .limit(1);
      
    if (!user) {
      console.error('User not found for customer:', invoice.customer);
      return;
    }
    
    // Update membership expiry
    const currentPeriodEnd = invoice.lines.data.find(line => line.type === 'subscription')?.period?.end;
    
    if (currentPeriodEnd) {
      await db.update(schema.users)
        .set({ 
          membershipLevel: 'gold',
          membershipExpires: new Date(currentPeriodEnd * 1000)
        })
        .where(eq(schema.users.id, user.id));
    }
    
    // Create notification for user
    await db.insert(schema.notifications)
      .values({
        userId: user.id,
        title: 'Subscription Renewed',
        message: `Your Gold membership subscription has been renewed. The next payment is due on ${new Date(currentPeriodEnd! * 1000).toLocaleDateString()}.`,
        type: 'Update'
      });
  } catch (error) {
    console.error('Error handling successful invoice payment:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription || !invoice.customer) return;
    
    // Find user by Stripe customer ID
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.stripeCustomerId, invoice.customer as string))
      .limit(1);
      
    if (!user) {
      console.error('User not found for customer:', invoice.customer);
      return;
    }
    
    // Create notification for user
    await db.insert(schema.notifications)
      .values({
        userId: user.id,
        title: 'Subscription Payment Failed',
        message: `We couldn't charge your payment method for your Gold membership subscription. Please update your payment information to avoid service interruption.`,
        type: 'Alert'
      });
  } catch (error) {
    console.error('Error handling failed invoice payment:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    if (!subscription.customer) return;
    
    // Find user by Stripe customer ID
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.stripeCustomerId, subscription.customer as string))
      .limit(1);
      
    if (!user) {
      console.error('User not found for customer:', subscription.customer);
      return;
    }
    
    // If subscription is active, update membership expiry
    if (subscription.status === 'active') {
      await db.update(schema.users)
        .set({ 
          membershipLevel: 'gold',
          membershipExpires: new Date(subscription.current_period_end * 1000)
        })
        .where(eq(schema.users.id, user.id));
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    if (!subscription.customer) return;
    
    // Find user by Stripe customer ID
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.stripeCustomerId, subscription.customer as string))
      .limit(1);
      
    if (!user) {
      console.error('User not found for customer:', subscription.customer);
      return;
    }
    
    // Reset membership when subscription is canceled
    // But allow them to use the service until the end of the current period
    await db.update(schema.users)
      .set({ 
        membershipLevel: 'standard',
        // Keep the membershipExpires date as is, to allow access until the end of the paid period
      })
      .where(eq(schema.users.id, user.id));
    
    // Create notification for user
    await db.insert(schema.notifications)
      .values({
        userId: user.id,
        title: 'Subscription Canceled',
        message: `Your Gold membership subscription has been canceled. You'll have access until ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}.`,
        type: 'Update'
      });
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

export default router;