import { apiClient, LoginRequest, UserCreate, Token, UserResponse } from './apiClient';
import axios, { AxiosError } from 'axios';

// Auth token management class to centralize token storage logic
class TokenManager {
  // Save token to both cookie and sessionStorage
  static saveToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    // Save to sessionStorage for API requests
    try {
      sessionStorage.setItem('token', token);
      console.log('Token saved to sessionStorage');
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
    
    // Save to cookie for middleware/SSR
    try {
      this.setCookie('token', token, 1); // Short expiry time for security
      console.log('Token saved to cookie');
    } catch (error) {
      console.error('Error saving to cookie:', error);
    }
  }
  
  // Clear token from both storage mechanisms
  static clearToken(): void {
    if (typeof window === 'undefined') return;
    
    // Clear from sessionStorage
    try {
      sessionStorage.removeItem('token');
      console.log('Token cleared from sessionStorage');
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
    
    // Clear from cookie
    try {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict";
      console.log('Token cleared from cookie');
    } catch (error) {
      console.error('Error clearing cookie:', error);
    }
  }
  
  // Helper to set cookie with expiration
  static setCookie(name: string, value: string, days: number = 1): void {
    if (typeof document === 'undefined') return;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    // Use secure cookies in production
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? ';secure' : '';
    
    document.cookie = `${name}=${value};expires=${expiryDate.toUTCString()};path=/;samesite=strict${secureFlag}`;
    console.log(`Cookie ${name} set with expiry: ${days} days`);
  }
  
  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    let tokenExists = false;
    let tokenValue = null;
    
    // Check sessionStorage
    try {
      tokenValue = sessionStorage.getItem('token');
      tokenExists = !!tokenValue;
      if (tokenExists) {
        console.log('Token found in sessionStorage');
      }
    } catch (error) {
      console.error('Error reading sessionStorage:', error);
    }
    
    // If not in sessionStorage, check cookies
    if (!tokenExists && typeof document !== 'undefined') {
      const cookieToken = document.cookie
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('token='));
      
      if (cookieToken) {
        tokenValue = cookieToken.substring(6); // 'token='.length
        tokenExists = true;
        console.log('Token found in cookies');
        
        // Sync to sessionStorage if found in cookies
        try {
          sessionStorage.setItem('token', tokenValue);
          console.log('Token synced from cookies to sessionStorage');
        } catch (error) {
          console.error('Error syncing token to sessionStorage:', error);
        }
      }
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
      const cachedUserData = sessionStorage.getItem('user');
      
      if (cachedUserData) {
        const userData = JSON.parse(cachedUserData) as UserResponse;
        console.log('AuthService: Using cached user data');
        return userData;
      }
      
      // If no cached data, make the API call
      console.log('AuthService: Fetching current user data from API');
      const userData = await apiClient.getCurrentUser();
      
      // Cache the user data
      sessionStorage.setItem('user', JSON.stringify(userData));
      
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
      const cachedUserData = sessionStorage.getItem('user');
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


  // Logout user (client-side only)
  logout(): void {
    // Clear token from both sessionStorage and cookies
    TokenManager.clearToken();
    
    // Also clear user data from sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('user');
      } catch (error) {
        console.error('Error clearing user data:', error);
      }
    }
    
    console.log('AuthService: User logged out');
    // Redirect to login page will be handled by the component
  }
};
