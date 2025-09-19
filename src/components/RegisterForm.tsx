'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import { UserCreate } from '@/services/apiClient';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    name: '',
    password: '',
    role: 'user' // Role will be set by admin later, default is 'user' on the server
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.email || !formData.name || !formData.password) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Register: Attempting registration with:', { ...formData, password: '***hidden***' });
      
      // Register the user without auto-login
      const result = await AuthService.register(formData);
      console.log('Register: Registration successful:', result);
      
      // Log the success
      console.log('Register: Registration successful, redirecting to login');
      
      // Store success message in session storage for display after redirect
      sessionStorage.setItem('registrationSuccess', 'Registration successful! Please log in with your credentials.');
      
      // Use Next.js router for navigation instead of hard reload
      router.push('/login');
    } catch (err) {
      console.error('Register: Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again with a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
            <span className="label-text">Full Name</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full bg-base-200"
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
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
            autoComplete="new-password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            className="input input-bordered w-full bg-base-200"
            placeholder="Enter password (min. 8 characters)"
          />
        </div>

        <div className="form-control w-full">
          <div className="alert alert-info mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>You will be registered as a regular user. Admin roles are assigned by administrators.</span>
          </div>
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
                Creating account...
              </> : 
                'Register'
            }
          </button>
        </div>
        
        <div className="text-center mt-6">
          <Link href="/login" className="text-primary hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </>
  );
}
