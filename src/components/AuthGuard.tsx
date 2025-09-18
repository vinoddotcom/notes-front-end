'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/authService';

export default function AuthGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the user is logged in
    const checkAuth = async () => {
      try {
        if (!AuthService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        // Verify the token is valid by getting current user
        await AuthService.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token is invalid
        AuthService.logout();
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
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
  return <>{children}</>;
}
