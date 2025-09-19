'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import { UserResponse } from '@/services/apiClient';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<UserResponse | null | undefined>;
  // Add timestamp to track when the last refresh happened
  lastRefresh: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);

  // Initialize auth state
  useEffect(() => {
    async function initializeAuth() {
      setIsLoading(true);
      try {
        // Check if token exists
        if (!AuthService.isAuthenticated()) {
          console.log("Auth context: No token found");
          setIsLoading(false);
          return;
        }

        // Token exists, try to get user data
        console.log("Auth context: Token found, fetching user data");
        const userData = await AuthService.getCurrentUser();
        console.log("Auth context: User data fetched:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        setLastRefresh(Date.now());
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const loginData = {
        username,
        password,
        grant_type: 'password',
        scope: '',
        client_id: undefined,
        client_secret: undefined
      };

      await AuthService.login(loginData);
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      setLastRefresh(Date.now());
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const refreshUserData = async () => {
    // Even if not authenticated, try to fetch anyway as token might be in sessionStorage
    // but not yet loaded into the context
    console.log("Refreshing user data...");
    
    // Check if we refreshed recently (within the last 2 seconds) to prevent refresh loops
    const now = Date.now();
    if (lastRefresh && now - lastRefresh < 2000) {
      console.log("Skipping refresh - last refresh was too recent");
      return user;
    }
    
    try {
      // Check if token exists first to avoid unnecessary API calls
      if (!AuthService.isAuthenticated()) {
        console.log("No token found when refreshing user data");
        return null;
      }
      
      setIsLoading(true);
      // Update the lastRefresh timestamp
      setLastRefresh(now);
      
      const userData = await AuthService.getCurrentUser();
      console.log("User data refreshed:", userData);
      
      // Only update state if there's an actual change to prevent infinite loops
      if (JSON.stringify(userData) !== JSON.stringify(user)) {
        console.log("User data changed, updating state");
        setUser(userData);
        
        // Only update authentication status if it has changed
        if (!isAuthenticated) {
          setIsAuthenticated(true);
        }
      } else {
        console.log("User data unchanged, skipping state update");
      }
      
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      if (error instanceof Error && 
         (error.message.includes('Session expired') || 
          error.message.includes('401'))) {
        console.log("Session expired, logging out");
        logout();
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUserData,
    lastRefresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
