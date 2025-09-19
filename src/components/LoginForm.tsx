'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import { LoginRequest } from '@/services/apiClient';

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
    scope: '',
    grant_type: 'password',
    client_id: undefined,
    client_secret: undefined
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for registration success message in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const registrationSuccess = sessionStorage.getItem('registrationSuccess');
      if (registrationSuccess) {
        setSuccessMessage(registrationSuccess);
        // Remove it after displaying to prevent showing on refresh
        sessionStorage.removeItem('registrationSuccess');
      }
    }
  }, []);
  
  // Error message auto-clearing with timeout
  useEffect(() => {
    if (error) {
      // Auto-clear error after 5 seconds (5000ms)
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      
      // Clear the timer if the component unmounts or error changes
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Don't clear error immediately - let it persist until we get a response
    setIsLoading(true);

    // Basic validation
    if (!formData.username || !formData.password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Login: Attempting login with:', formData);
      
      const result = await AuthService.login(formData);
      console.log('Login: Login successful, result:', result);
      
      // Token should already be saved by AuthService
      
      try {
        // Fetch user information
        console.log('Login: Fetching user data...');
        const userData = await AuthService.getCurrentUser();
        console.log('Login: User data fetched:', userData);
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to dashboard
        console.log('Login: Redirecting to dashboard...');
        router.push('/dashboard');
      } catch (userError) {
        console.error('Login: Error fetching user data:', userError);
        setError('Login successful, but could not fetch user data. Please try again.');
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Login: Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {successMessage && (
        <div className="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage('')}
            className="btn btn-sm btn-ghost ml-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="btn btn-sm btn-ghost ml-auto"
            aria-label="Close error message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            id="username"
            name="username"
            type="email"
            autoComplete="email"
            required
            value={formData.username}
            onChange={handleChange}
            className="input input-bordered w-full bg-base-200"
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="input input-bordered w-full bg-base-200"
            placeholder="Enter your password"
          />
        </div>

        <div className="form-control mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full text-primary-content"
          >
            {isLoading ? 
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Signing in...
              </> : 
              'Sign in'
            }
          </button>
        </div>
        
        <div className="text-center mt-6">
          <Link href="/register" className="text-primary hover:underline">
            Don&apos;t have an account? Register
          </Link>
        </div>
      </form>
    </>
  );
}
