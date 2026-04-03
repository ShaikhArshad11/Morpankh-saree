'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initializeAuth = useStore((state) => state.initializeAuth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize authentication on app startup
    initializeAuth();
    // Mark as initialized after a short delay to ensure state is set
    const timer = setTimeout(() => setIsInitialized(true), 50);
    return () => clearTimeout(timer);
  }, [initializeAuth]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Initializing...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
