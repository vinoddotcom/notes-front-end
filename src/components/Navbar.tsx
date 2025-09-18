'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserResponse } from '@/services/apiClient';
import { AuthService } from '@/services/authService';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<string>('light');

  useEffect(() => {
    // Check if user selected a theme previously
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to fetch user data', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const themes = [
    // Light themes
    { id: 'light', name: 'Light', category: 'Light' },
    { id: 'cupcake', name: 'Cupcake', category: 'Light' },
    { id: 'bumblebee', name: 'Bumblebee', category: 'Light' },
    { id: 'emerald', name: 'Emerald', category: 'Light' },
    { id: 'corporate', name: 'Corporate', category: 'Light' },
    { id: 'garden', name: 'Garden', category: 'Light' },
    { id: 'aqua', name: 'Aqua', category: 'Light' },
    { id: 'pastel', name: 'Pastel', category: 'Light' },
    { id: 'fantasy', name: 'Fantasy', category: 'Light' },
    { id: 'wireframe', name: 'Wireframe', category: 'Light' },
    { id: 'cmyk', name: 'CMYK', category: 'Light' },
    { id: 'autumn', name: 'Autumn', category: 'Light' },
    { id: 'business', name: 'Business', category: 'Light' },
    { id: 'acid', name: 'Acid', category: 'Light' },
    { id: 'lemonade', name: 'Lemonade', category: 'Light' },
    { id: 'winter', name: 'Winter', category: 'Light' },
    
    // Dark themes
    { id: 'dark', name: 'Dark', category: 'Dark' },
    { id: 'synthwave', name: 'Synthwave', category: 'Dark' },
    { id: 'retro', name: 'Retro', category: 'Dark' },
    { id: 'cyberpunk', name: 'Cyberpunk', category: 'Dark' },
    { id: 'valentine', name: 'Valentine', category: 'Dark' },
    { id: 'halloween', name: 'Halloween', category: 'Dark' },
    { id: 'forest', name: 'Forest', category: 'Dark' },
    { id: 'lofi', name: 'Lo-Fi', category: 'Dark' },
    { id: 'black', name: 'Black', category: 'Dark' },
    { id: 'luxury', name: 'Luxury', category: 'Dark' },
    { id: 'dracula', name: 'Dracula', category: 'Dark' },
    { id: 'night', name: 'Night', category: 'Dark' },
    { id: 'coffee', name: 'Coffee', category: 'Dark' },
    { id: 'dim', name: 'Dim', category: 'Dark' },
    { id: 'nord', name: 'Nord', category: 'Dark' },
    { id: 'sunset', name: 'Sunset', category: 'Dark' }
  ];

  return (
    <div className="navbar bg-base-200 shadow">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {user && (
              <>
                <li><Link href="/dashboard">Dashboard</Link></li>
                {user.role === 'admin' && (
                  <li><Link href="/admin/users">User Management</Link></li>
                )}
              </>
            )}
          </ul>
        </div>
        <Link href={user ? '/dashboard' : '/'} className="btn btn-ghost normal-case text-xl">Notes App</Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {user && (
            <>
              <li><Link href="/dashboard">Dashboard</Link></li>
              {user.role === 'admin' && (
                <li><Link href="/admin/users">User Management</Link></li>
              )}
            </>
          )}
        </ul>
      </div>
      
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <ul tabIndex={0} className="dropdown-content menu p-3 shadow bg-base-100 rounded-box w-64 mt-4 z-[1] max-h-96 overflow-y-auto">
            <li className="menu-title">Light Themes</li>
            {themes.filter(t => t.category === 'Light').map(t => (
              <li key={t.id}>
                <button 
                  className={`${theme === t.id ? 'active' : ''} w-full text-left`} 
                  onClick={() => handleThemeChange(t.id)}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-base-300 bg-base-100"></span>
                    {t.name}
                  </span>
                </button>
              </li>
            ))}
            <li className="menu-title mt-2">Dark Themes</li>
            {themes.filter(t => t.category === 'Dark').map(t => (
              <li key={t.id}>
                <button 
                  className={`${theme === t.id ? 'active' : ''} w-full text-left`} 
                  onClick={() => handleThemeChange(t.id)}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-base-300 bg-base-100"></span>
                    {t.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {loading ? (
          <span className="loading loading-spinner loading-sm mx-2"></span>
        ) : user ? (
          <div className="dropdown dropdown-end ml-2">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <span className="font-medium">{user.name}</span>
              <span className="badge badge-primary ml-2">{user.role}</span>
            </div>
            <ul tabIndex={0} className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4">
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        ) : error ? (
          <span className="text-error text-sm mx-2">{error}</span>
        ) : (
          <div className="flex items-center space-x-2">
            <Link href="/login" className="btn btn-sm btn-outline">Login</Link>
            <Link href="/register" className="btn btn-sm btn-primary">Register</Link>
          </div>
        )}
      </div>
    </div>
  );
}
