'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CustomerAddress {
  id: string;
  label: string;
  address: string;
  district: string;
  deliveryArea?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface CustomerProfile {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  district: string | null;
  deliveryArea: string | null;
  addresses: CustomerAddress[];
}

export interface CustomerStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
}

interface CustomerAuthContextType {
  customer: CustomerProfile | null;
  stats: CustomerStats | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    confirmPassword?: string;
    address: string;
    district: string;
    deliveryArea?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentCustomer = useCallback(async () => {
    try {
      const res = await fetch('/api/customer/auth/me', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCustomer(json.data.customer);
          setStats(json.data.stats || null);
          return;
        }
      }
      setCustomer(null);
      setStats(null);
    } catch (err) {
      console.warn('Customer session check failed:', err);
      setCustomer(null);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentCustomer();
  }, [fetchCurrentCustomer]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/customer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.data);
        await fetchCurrentCustomer();
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const register = async (regData: any) => {
    try {
      const res = await fetch('/api/customer/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.data);
        await fetchCurrentCustomer();
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/customer/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout request error:', e);
    } finally {
      setCustomer(null);
      setStats(null);
      window.location.href = '/';
    }
  };

  const updateProfile = async (updateData: Partial<CustomerProfile>) => {
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.data);
        return { success: true };
      }
      return { success: false, error: data.error || 'Update failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        stats,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshCustomer: fetchCurrentCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
