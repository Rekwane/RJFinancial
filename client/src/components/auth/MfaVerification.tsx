import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface MfaVerificationProps {
  userId: number;
  onComplete?: () => void;
}

export const MfaVerification: React.FC<MfaVerificationProps> = ({ userId, onComplete }) => {
  const [emailCode, setEmailCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
  const { verifyMfa, requestEmailVerification, requestSmsVerification } = useAuth();
  const { toast } = useToast();

  const handleVerifyEmail = async () => {
    try {
      await verifyMfa.mutateAsync({
        userId,
        code: emailCode,
        type: 'email',
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'The code you entered is incorrect or has expired.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifySms = async () => {
    try {
      await verifyMfa.mutateAsync({
        userId,
        code: smsCode,
        type: 'sms',
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'The code you entered is incorrect or has expired.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestEmailCode = async () => {
    try {
      await requestEmailVerification.mutateAsync();
      toast({
        title: 'Verification Code Sent',
        description: 'Check your email for a verification code.',
      });
    } catch (error) {
      toast({
        title: 'Failed to Send Code',
        description: 'Could not send verification code to your email.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestSmsCode = async () => {
    try {
      await requestSmsVerification.mutateAsync();
      toast({
        title: 'Verification Code Sent',
        description: 'Check your phone for an SMS with the verification code.',
      });
    } catch (error) {
      toast({
        title: 'Failed to Send Code',
        description: 'Could not send verification code to your phone.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Verify your identity to secure your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'email' | 'sms')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email Verification</TabsTrigger>
            <TabsTrigger value="sms">SMS Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to your email address. Enter the code below to verify your account.
              </p>
              
              <div className="space-y-2">
                <Input
                  placeholder="Enter 6-digit code"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-xl tracking-widest"
                  maxLength={6}
                />
                
                <div className="flex justify-end">
                  <Button 
                    variant="link" 
                    onClick={handleRequestEmailCode}
                    disabled={requestEmailVerification.isPending}
                    size="sm"
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleVerifyEmail} 
                disabled={emailCode.length !== 6 || verifyMfa.isPending}
                className="w-full"
              >
                {verifyMfa.isPending ? 'Verifying...' : 'Verify Email'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="sms">
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to your phone number. Enter the code below to verify your account.
              </p>
              
              <div className="space-y-2">
                <Input
                  placeholder="Enter 6-digit code"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-xl tracking-widest"
                  maxLength={6}
                />
                
                <div className="flex justify-end">
                  <Button 
                    variant="link" 
                    onClick={handleRequestSmsCode}
                    disabled={requestSmsVerification.isPending}
                    size="sm"
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleVerifySms} 
                disabled={smsCode.length !== 6 || verifyMfa.isPending}
                className="w-full"
              >
                {verifyMfa.isPending ? 'Verifying...' : 'Verify SMS'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <p className="text-xs text-muted-foreground text-center">
          Verification codes expire after 10 minutes for security reasons. 
          If your code has expired, please request a new one.
        </p>
      </CardFooter>
    </Card>
  );
};

export default MfaVerification;