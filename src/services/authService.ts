import { apiClient, LoginRequest, UserCreate, Token, UserResponse } from './apiClient';
import axios, { AxiosError } from 'axios';

// Auth token management class to centralize token storage logic
class TokenManager {
  // Save token to both cookie and localStorage
  static saveToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    // Save to localStorage for API requests
    try {
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    // Save to cookie for middleware/SSR
    try {
      this.setCookie('token', token, 7);
      console.log('Token saved to cookie');
    } catch (error) {
      console.error('Error saving to cookie:', error);
    }
  }
  
  // Clear token from both storage mechanisms
  static clearToken(): void {
    if (typeof window === 'undefined') return;
    
    // Clear from localStorage
    try {
      localStorage.removeItem('token');
      console.log('Token cleared from localStorage');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    // Clear from cookie
    try {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      console.log('Token cleared from cookie');
    } catch (error) {
      console.error('Error clearing cookie:', error);
    }
  }
  
  // Helper to set cookie with expiration
  static setCookie(name: string, value: string, days: number = 7): void {
    if (typeof document === 'undefined') return;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    document.cookie = `${name}=${value};expires=${expiryDate.toUTCString()};path=/`;
  }
  
  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    let tokenExists = false;
    
    // Check localStorage
    try {
      tokenExists = !!localStorage.getItem('token');
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
    
    // If not in localStorage, check cookies
    if (!tokenExists && typeof document !== 'undefined') {
      tokenExists = document.cookie.split(';').some(c => 
        c.trim().startsWith('token=')
      );
    }
    
    return tokenExists;
  }
}

export const AuthService = {
  // Register a new user
  async register(userData: UserCreate): Promise<UserResponse> {
    try {
      console.log('AuthService: Attempting registration with:', { ...userData, password: '***hidden***' });
      
      // Ensure data is properly formatted
      const registrationData: UserCreate = {
        email: userData.email.trim(),
        name: userData.name.trim(),
        password: userData.password,
        role: 'user' // Always set as user, admin role is assigned later
      };
      
      const response = await apiClient.register(registrationData);
      console.log('AuthService: Registration successful', response);
      
      // Return the response data to be used by the component
      return response;
    } catch (error) {
      console.error('AuthService: Registration error:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        if (axiosError.response?.status === 400) {
          throw new Error(axiosError.response?.data?.detail || 'Email already registered');
        } else if (axiosError.response?.status === 422) {
          throw new Error('Invalid data. Please check your inputs.');
        }
        throw new Error(axiosError.response?.data?.detail || 'Registration failed');
      }
      throw new Error('Registration failed due to a network error. Please try again later.');
    }
  },
  
  // Register and auto-login
  async registerAndLogin(userData: UserCreate): Promise<Token> {
    try {
      // First register the user
      await this.register(userData);
      console.log('AuthService: User registered successfully, proceeding to auto-login');
      
      // Then immediately log them in
      const loginData: LoginRequest = {
        username: userData.email.trim(),
        password: userData.password,
        grant_type: 'password',
        scope: '',
        client_id: undefined,
        client_secret: undefined
      };
      
      // Log in with the credentials
      const token = await this.login(loginData);
      console.log('AuthService: Auto-login successful after registration');
      
      return token;
    } catch (error) {
      console.error('AuthService: Register and auto-login failed:', error);
      throw error;
    }
  },

  // Login user
  async login(credentials: LoginRequest): Promise<Token> {
    try {
      console.log('AuthService: Attempting login with:', credentials);
      
      // Ensure credentials are properly formatted
      const loginData: LoginRequest = {
        username: credentials.username.trim(),
        password: credentials.password,
        grant_type: 'password',
        scope: '',
        client_id: undefined,
        client_secret: undefined
      };
      
      const result = await apiClient.login(loginData);
      
      // Save token to local storage and cookie
      if (result && result.access_token) {
        // Use TokenManager to save token in both places
        TokenManager.saveToken(result.access_token);
        console.log('AuthService: Login successful, token saved');
      } else {
        console.error('AuthService: Login response missing access_token');
        throw new Error('Invalid response from server');
      }
      
      return result;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        throw new Error(axiosError.response?.data?.detail || 'Login failed - server error');
      }
      throw new Error(error instanceof Error ? error.message : 'Login failed - unexpected error');
    }
  },

  // Get current user info
  async getCurrentUser(): Promise<UserResponse> {
    try {
      // First check if we have cached user data
      const cachedUserData = localStorage.getItem('user');
      
      if (cachedUserData) {
        const userData = JSON.parse(cachedUserData) as UserResponse;
        console.log('AuthService: Using cached user data');
        return userData;
      }
      
      // If no cached data, make the API call
      console.log('AuthService: Fetching current user data from API');
      const userData = await apiClient.getCurrentUser();
      
      // Cache the user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('AuthService: Error fetching current user:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        if (axiosError.response?.status === 401) {
          TokenManager.clearToken();
          console.log('AuthService: Token cleared due to 401 response');
          throw new Error('Session expired, please login again');
        }
        throw new Error(axiosError.response?.data?.detail || 'Failed to fetch user data');
      }
      throw new Error('Failed to fetch user data');
    }
  },
  
  // Get cached user data (without making an API call)
  getCachedUser(): UserResponse | null {
    try {
      const cachedUserData = localStorage.getItem('user');
      if (cachedUserData) {
        return JSON.parse(cachedUserData) as UserResponse;
      }
      return null;
    } catch (error) {
      console.error('AuthService: Error getting cached user data:', error);
      return null;
    }
  },

  // Check if user is authenticated (check both localStorage and cookies)
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  },

  // Get cached user data (without API call)
  // getCachedUser(): UserResponse | null {
  //   const userData = localStorage.getItem('user');
  //   return userData ? JSON.parse(userData) : null;
  // },

  // Logout user (client-side only)
  logout(): void {
    // Clear token from both localStorage and cookies
    TokenManager.clearToken();
    
    // Also clear user data from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error clearing user data:', error);
      }
    }
    
    console.log('AuthService: User logged out');
    // Redirect to login page will be handled by the component
  }
};
