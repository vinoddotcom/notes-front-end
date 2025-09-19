'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUserData, lastRefresh } = useAuth();
  // Use a more explicit check for admin role
  const isAdmin = user ? user.role === 'admin' : false;
  
  // Simplified useEffect that only refreshes when absolutely necessary
  useEffect(() => {
    console.log("AdminGuard state:", { 
      isLoading, 
      isAuthenticated, 
      userRole: user?.role,
      isAdmin,
      lastRefreshTime: lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : 'never'
    });

    // Only refresh if we're authenticated but don't have role information
    if (isAuthenticated && !isLoading && !user?.role && (!lastRefresh || Date.now() - lastRefresh > 5000)) {
      console.log("AdminGuard: User authenticated but role missing, refreshing data");
      refreshUserData();
    }

    // Only redirect under specific conditions
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated at all
        console.log("AdminGuard: Redirecting to login (not authenticated)");
        router.push('/login');
      } else if (user && user.role !== 'admin') {
        // We have user data and confirmed NOT an admin
        console.log("AdminGuard: Redirecting to dashboard (confirmed not admin)");
        router.push('/dashboard');
      } else if (user && user.role === 'admin') {
        console.log("AdminGuard: Confirmed admin user, allowing access");
        // No redirect needed - user is admin
      }
    }
  // Include all dependencies except refreshUserData
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, router, user, lastRefresh]);

  // Show loading state while checking authorization or when we're still determining admin status
  if (isLoading || (isAuthenticated && user === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  // If we have the user data and they're an admin, show the content
  // Otherwise, we'll redirect them anyway (in the useEffect above)
  return (user && user.role === 'admin') ? <>{children}</> : null;
}
