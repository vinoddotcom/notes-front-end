import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { components } from '@/types/generated/api';

// Define types from generated schema
export type UserCreate = components['schemas']['UserCreate'];
export type UserResponse = components['schemas']['UserResponse'];
export type Token = components['schemas']['Token'];
export type LoginRequest = components['schemas']['Body_login_api_v1_auth_login_post'];
export type NoteCreate = components['schemas']['NoteCreate'];
export type NoteUpdate = components['schemas']['NoteUpdate'];
export type NoteResponse = components['schemas']['NoteResponse'];

const API_URL = 'https://api-notes.vinod.digital';

class ApiClient {
  private axiosInstance: AxiosInstance;

  // Helper method to get token from cookie
  private getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        return value;
      }
    }
    return null;
  }

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
    });

    // Add request interceptor to include auth token in requests
    this.axiosInstance.interceptors.request.use((config) => {
      // Only run in browser environment
      if (typeof window !== 'undefined') {
        // Try to get token from cookies first, then fall back to localStorage
        const cookieToken = this.getTokenFromCookie();
        const localToken = localStorage.getItem('token');
        const token = cookieToken || localToken;
        
        console.log('API Request - Token available in cookies:', !!cookieToken);
        console.log('API Request - Token available in localStorage:', !!localToken);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('API Request - Added token to headers');
        }
      }
      return config;
    });
    
    // Add response interceptor to handle common error cases
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access - clear token and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async register(userData: UserCreate): Promise<UserResponse> {
    try {
      console.log('API Client: Registering user with:', { ...userData, password: '***hidden***' });
      const response = await this.axiosInstance.post('/api/v1/auth/register', userData);
      console.log('API Client: Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Client: Registration error:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Client: Error details:', error.response?.data);
      }
      throw error; // Let the AuthService handle error formatting
    }
  }

  async login(credentials: LoginRequest): Promise<Token> {
    try {
      const formData = new URLSearchParams();
      Object.entries(credentials).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add debugging logs
      console.log('Login credentials:', JSON.stringify(credentials));
      console.log('FormData:', formData.toString());

      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await this.axiosInstance.post('/api/v1/auth/login', formData, config);
      console.log('Login success response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data);
        throw new Error(error.response?.data?.detail || 'Login failed - server error');
      }
      console.error('Unknown login error:', error);
      throw new Error('Login failed - unexpected error');
    }
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.axiosInstance.get('/api/v1/auth/me');
    return response.data;
  }

  // Note methods
  async getNotes(skip = 0, limit = 100): Promise<NoteResponse[]> {
    const response = await this.axiosInstance.get(`/api/v1/notes/?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getNoteById(noteId: number): Promise<NoteResponse> {
    const response = await this.axiosInstance.get(`/api/v1/notes/${noteId}`);
    return response.data;
  }

  async createNote(note: NoteCreate): Promise<NoteResponse> {
    const response = await this.axiosInstance.post('/api/v1/notes/', note);
    return response.data;
  }

  async updateNote(noteId: number, note: NoteUpdate): Promise<NoteResponse> {
    const response = await this.axiosInstance.put(`/api/v1/notes/${noteId}`, note);
    return response.data;
  }

  async deleteNote(noteId: number): Promise<void> {
    await this.axiosInstance.delete(`/api/v1/notes/${noteId}`);
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
