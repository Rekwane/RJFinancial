import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useState } from "react";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  membershipLevel: string;
  membershipExpires?: string;
  profileImageUrl?: string;
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [requiresMfa, setRequiresMfa] = useState<boolean>(false);
  const [mfaUserId, setMfaUserId] = useState<number | null>(null);

  // Check if user is authenticated
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  // Register mutation
  const register = useMutation({
    mutationFn: async (userData: {
      username: string;
      email: string;
      password: string;
      fullName: string;
      phoneNumber?: string;
    }) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await response.json();
      
      // Handle MFA if required
      if (data.requiresMfa) {
        setRequiresMfa(true);
        setMfaUserId(data.userId);
        return data;
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (!data.requiresMfa) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      }
    },
  });

  // MFA verification mutation
  const verifyMfa = useMutation({
    mutationFn: async ({ userId, code, type }: { userId: number; code: string; type: 'email' | 'sms' }) => {
      const response = await apiRequest('POST', '/api/auth/verify-mfa', { userId, code, type });
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      setRequiresMfa(false);
      setMfaUserId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Request email verification
  const requestEmailVerification = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/request-email-verification');
      const data = await response.json();
      return data;
    },
  });

  // Request SMS verification
  const requestSmsVerification = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/request-sms-verification');
      const data = await response.json();
      return data;
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout');
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    requiresMfa,
    mfaUserId,
    verifyMfa,
    requestEmailVerification,
    requestSmsVerification,
  };
}