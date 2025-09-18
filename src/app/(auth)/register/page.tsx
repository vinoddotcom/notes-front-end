'use client';

import { useState } from 'react';
import Link from 'next/link';
// Removed useRouter since we're using window.location.href for redirection
import { AuthService } from '@/services/authService';
import { UserCreate } from '@/services/apiClient';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
  // Removed router initialization since we're not using it
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    name: '',
    password: '',
    role: 'user' // Default role
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      
      // Show success message before redirect
      alert('Registration successful! Please log in with your credentials.');
      
      // Add more logging for redirect
      console.log('Register: Redirecting to login page...');
      
      // Force a hard navigation to the login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Register: Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again with a different email.');
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
            <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
            
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
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-base-200"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="label">
                  <span className="label-text-alt">Admin can manage all notes, User can manage only their notes</span>
                </label>
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
          </div>
        </div>
      </div>
    </>
  );
}
