'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initializeAuth = useStore((state) => state.initializeAuth);
  const loadProducts = useStore((state) => state.loadProducts);
  const loadCategories = useStore((state) => state.loadCategories);
  const [isInitialized, setIsInitialized] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        initializeAuth();
        await Promise.all([loadProducts(), loadCategories()]);
      } catch (err) {
        console.error('App bootstrap failed:', err);
      } finally {
        if (!cancelled) {
          setIsInitialized(true);
        }
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [initializeAuth, loadProducts, loadCategories]);

  return <>{children}</>;
};

export default AuthProvider;
