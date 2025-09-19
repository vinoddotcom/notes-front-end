'use client';

export const runtime = 'edge';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Always redirect - if authenticated, go to dashboard, otherwise to login page
    if (typeof window !== 'undefined') {
      if (AuthService.isAuthenticated()) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Authenticating...</p>
      </div>
    </div>
  );
}
