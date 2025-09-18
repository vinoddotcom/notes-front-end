'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import { LoginRequest } from '@/services/apiClient';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
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
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-center mb-6">Sign In</h2>
            
            {error && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
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
          </div>
        </div>
      </div>
    </>
  );
}
