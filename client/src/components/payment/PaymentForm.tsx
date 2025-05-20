import React, { useEffect, useState } from 'react';
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

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object
// This ensures proper Stripe instantiation and prevents performance issues
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  amount: number;
  serviceId?: number;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Internal form component that uses the Stripe hooks
const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  serviceId,
  description,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Only create a payment intent if the amount is valid and the user is authenticated
    if (amount > 0 && isAuthenticated) {
      setProcessing(true);
      
      apiRequest('POST', '/api/payment/create-payment-intent', {
        amount,
        currency: 'usd',
        serviceId,
        description,
      })
        .then((response) => response.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((err) => {
          console.error('Error creating payment intent:', err);
          setError('Failed to initialize payment. Please try again.');
          if (onError) onError('Failed to initialize payment');
        })
        .finally(() => {
          setProcessing(false);
        });
    }
  }, [amount, isAuthenticated, serviceId, description]);

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
        title: 'Payment Failed',
        description: stripeError.message || 'There was an issue processing your payment',
        variant: 'destructive',
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful
      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully',
      });
      
      // Notify the parent component
      if (onSuccess) onSuccess();
    }

    setProcessing(false);
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md bg-card">
        <div className="mb-4">
          <label className="text-sm font-medium text-muted-foreground">Credit/Debit Card</label>
          <CardElement options={cardElementOptions} className="p-3 border mt-1 rounded-md" />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={!stripe || processing || !clientSecret}
          className="w-full"
        >
          {processing ? 'Processing...' : `Pay $${(amount).toFixed(2)}`}
        </Button>
      </div>
      
      <div className="text-xs text-center text-muted-foreground">
        Your payment is processed securely through Stripe. RJFinancial does not store your card details.
      </div>
    </form>
  );
};

// Wrapper component that provides the Stripe context
export const PaymentForm: React.FC<CheckoutFormProps> = (props) => {
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="p-4 border rounded-md bg-card">
        <p className="text-red-500">Stripe API key is missing. Payment is not available.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;