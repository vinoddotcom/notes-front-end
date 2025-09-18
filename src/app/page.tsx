'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import Navbar from '@/components/Navbar';
import TestComponent from '@/components/TestComponent';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in and redirect accordingly
    if (typeof window !== 'undefined' && AuthService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <>
      <Navbar />
      <div className="hero min-h-[calc(100vh-64px)]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-primary">Notes Application</h1>
            <p className="py-6">
              A simple and elegant application to manage your notes. Sign in to create, edit, and organize your notes in one place.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => router.push('/login')} 
                className="btn btn-primary"
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/register')} 
                className="btn btn-outline"
              >
                Register
              </button>
            </div>
            
            {/* Test component to verify styling */}
            <div className="mt-8">
              <TestComponent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
