'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Redirect to login if not authenticated and not currently loading
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Return the children if authentication check passes
  return isAuthenticated ? <>{children}</> : null;
}
