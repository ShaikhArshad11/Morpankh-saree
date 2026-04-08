'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initializeAuth = useStore((state) => state.initializeAuth);
  const loadProducts = useStore((state) => state.loadProducts);

  useEffect(() => {
    // Initialize authentication on app startup
    initializeAuth();
    loadProducts();
  }, [initializeAuth, loadProducts]);

  return <>{children}</>;
};

export default AuthProvider;
