'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/authService';

export default function AdminGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the user is logged in and is an admin
    const checkAdminAuth = async () => {
      try {
        if (!AuthService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        // Verify the token is valid by getting current user
        const userData = await AuthService.getCurrentUser();
        
        if (userData.role !== 'admin') {
          // User is authenticated but not an admin
          router.push('/dashboard');
          return;
        }
        
        setIsAuthorized(true);
      } catch (error) {
        console.error('Admin auth check failed:', error);
        // Token is invalid or other error
        AuthService.logout();
        router.push('/login');
      }
    };

    checkAdminAuth();
  }, [router]);

  // Show loading state while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Return the children if admin check passes
  return <>{children}</>;
}
