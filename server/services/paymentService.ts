import Stripe from 'stripe';
import { db } from '../db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Create or retrieve Stripe customer for user
export async function getOrCreateStripeCustomer(userId: number, email: string, name: string): Promise<string> {
  try {
    // Check if user already has a Stripe customer ID
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: userId.toString(),
      },
    });

    // Save Stripe customer ID to user
    await db.update(schema.users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(schema.users.id, userId));

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create Stripe customer');
  }
}

// Create a payment intent for one-time payment
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  customerId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

// Create a subscription
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

// Record transaction in the database
export async function recordTransaction(
  userId: number,
  amount: number,
  transactionType: string,
  status: string,
  stripePaymentIntentId?: string,
  stripeSessionId?: string,
  serviceId?: number,
  description?: string,
  metadata?: any
): Promise<schema.Transaction> {
  try {
    const [transaction] = await db.insert(schema.transactions)
      .values({
        userId,
        amount: Math.round(amount * 100), // Store in cents
        transactionType,
        status,
        stripePaymentIntentId,
        stripeSessionId,
        serviceId,
        description,
        metadata
      })
      .returning();

    return transaction;
  } catch (error) {
    console.error('Error recording transaction:', error);
    throw new Error('Failed to record transaction');
  }
}

// Update transaction status
export async function updateTransactionStatus(
  id: number,
  status: string
): Promise<schema.Transaction> {
  try {
    const [updatedTransaction] = await db.update(schema.transactions)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(schema.transactions.id, id))
      .returning();

    return updatedTransaction;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction status');
  }
}

// Get a PaymentIntent by ID
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

// Update membership level based on subscription
export async function updateMembershipLevel(
  userId: number,
  membershipLevel: string,
  expiryDate: Date
): Promise<void> {
  try {
    await db.update(schema.users)
      .set({ 
        membershipLevel,
        membershipExpires: expiryDate
      })
      .where(eq(schema.users.id, userId));
  } catch (error) {
    console.error('Error updating membership level:', error);
    throw new Error('Failed to update membership level');
  }
}

// Lookup a user by Stripe customer ID
export async function getUserByStripeCustomerId(
  customerId: string
): Promise<schema.User | undefined> {
  try {
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.stripeCustomerId, customerId));
    
    return user;
  } catch (error) {
    console.error('Error finding user by customer ID:', error);
    throw new Error('Failed to look up user by customer ID');
  }
}

// Create a setup intent for saving payment methods
export async function createSetupIntent(
  customerId: string
): Promise<Stripe.SetupIntent> {
  try {
    return await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw new Error('Failed to create setup intent');
  }
}

// List payment methods for a customer
export async function listPaymentMethods(
  customerId: string
): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
  try {
    return await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
  } catch (error) {
    console.error('Error listing payment methods:', error);
    throw new Error('Failed to list payment methods');
  }
}

// Delete a payment method
export async function deletePaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  try {
    return await stripe.paymentMethods.detach(paymentMethodId);
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw new Error('Failed to delete payment method');
  }
}