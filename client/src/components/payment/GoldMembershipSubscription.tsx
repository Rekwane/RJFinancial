import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BillingInfoForm } from './BillingInfoForm';
import { Shield, CheckCircle, ArrowRight, Star } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object
// This ensures proper Stripe instantiation and prevents performance issues
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Price ID for Gold Membership - in a real app, this would come from the backend or environment
const GOLD_MEMBERSHIP_PRICE_ID = 'price_gold_membership';

interface SubscriptionFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Internal form component that uses the Stripe hooks
const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'billing-info' | 'payment'>('billing-info');
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Only create a subscription if the user is authenticated
    if (isAuthenticated) {
      setProcessing(true);
      
      apiRequest('POST', '/api/payment/create-subscription', {
        priceId: GOLD_MEMBERSHIP_PRICE_ID,
        metadata: {
          plan: 'gold',
          feature: 'all_access'
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((err) => {
          console.error('Error creating subscription:', err);
          setError('Failed to initialize subscription. Please try again.');
          if (onError) onError('Failed to initialize subscription');
        })
        .finally(() => {
          setProcessing(false);
        });
    }
  }, [isAuthenticated, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable form submission until Stripe.js has loaded
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Payment form is not properly loaded');
      setProcessing(false);
      return;
    }

    // Confirm the card payment
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: user?.fullName || 'Unknown',
          email: user?.email,
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'An error occurred during payment');
      if (onError) onError(stripeError.message || 'Payment failed');
      
      toast({
        title: 'Subscription Failed',
        description: stripeError.message || 'There was an issue processing your payment',
        variant: 'destructive',
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful
      toast({
        title: 'Subscription Activated',
        description: 'Your Gold Membership has been successfully activated!',
      });
      
      // Notify the parent component
      if (onSuccess) onSuccess();
    }

    setProcessing(false);
  };

  const handleBillingInfoComplete = () => {
    setStep('payment');
  };
  
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true, // We already collect this in billing info
  };

  // Step 1: Collect billing information
  if (step === 'billing-info') {
    return <BillingInfoForm onSuccess={handleBillingInfoComplete} />;
  }

  // Step 2: Payment with credit card for subscription
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>Gold Membership Subscription</span>
        </CardTitle>
        <CardDescription>
          Unlock all premium features and gold membership benefits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Gold Membership Benefits:</h3>
            <ul className="space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Full access to trust document creation tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Unlimited dispute letter templates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Priority processing for EIN applications</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Expert financial advisory services</span>
              </li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Credit/Debit Card
              </label>
              <div className="mt-1 p-3 border rounded-md">
                <CardElement options={cardElementOptions} />
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={!stripe || processing || !clientSecret}
                className="w-full"
              >
                {processing ? 'Processing...' : 'Subscribe to Gold Membership - $49.99/month'}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Your payment is secured with 256-bit encryption</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          By subscribing, you agree to our Terms of Service and authorize RJFinancial to charge your card monthly until you cancel.
        </p>
      </CardFooter>
    </Card>
  );
};

// Wrapper component that provides the Stripe context
export const GoldMembershipSubscription: React.FC<SubscriptionFormProps> = (props) => {
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="p-4 border rounded-md bg-card">
        <p className="text-red-500">Stripe API key is missing. Subscription is not available.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <SubscriptionForm {...props} />
    </Elements>
  );
};

export default GoldMembershipSubscription;