import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { components, operations } from '@/types/generated/api';

// Define types from generated schema
export type UserCreate = components['schemas']['UserCreate'];
export type UserResponse = components['schemas']['UserResponse'];
export type Token = components['schemas']['Token'];
export type LoginRequest = components['schemas']['Body_login_api_v1_auth_login_post'];
export type NoteCreate = components['schemas']['NoteCreate'];
export type NoteUpdate = components['schemas']['NoteUpdate'];
export type NoteResponse = components['schemas']['NoteResponse'];
export type PaginatedNoteResponse = operations["get_notes_api_v1_notes__get"]["responses"]["200"]["content"]["application/json"];
export type PaginatedUserResponse = operations["get_users_api_v1_admin_users__get"]["responses"]["200"]["content"]["application/json"];

export type UserUpdateRole = components['schemas']['UserUpdateRole'];
export type UserUpdateStatus = components['schemas']['UserUpdateStatus'];

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
        console.log('API Client: Found token in cookies');
        return value;
      }
    }
    return null;
  }
  
  // Helper method to get token from sessionStorage
  private getTokenFromSessionStorage(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        console.log('API Client: Found token in sessionStorage');
      }
      return token;
    } catch (error) {
      console.error('API Client: Error reading from sessionStorage:', error);
      return null;
    }
  }

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
    });

    // Add request interceptor to include auth token in requests
    this.axiosInstance.interceptors.request.use((config) => {
      // Only run in browser environment
      if (typeof window !== 'undefined') {
        // Try to get token from sessionStorage first, then fall back to cookies
        const sessionToken = this.getTokenFromSessionStorage();
        const cookieToken = this.getTokenFromCookie();
        const token = sessionToken || cookieToken;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('API Request - Added token to headers');
          
          // If token was found in cookies but not in sessionStorage, store it there
          if (cookieToken && !sessionToken) {
            try {
              sessionStorage.setItem('token', cookieToken);
              console.log('API Request - Synchronized token from cookie to sessionStorage');
            } catch (error) {
              console.error('API Request - Error saving token to sessionStorage:', error);
            }
          }
        } else {
          console.log('API Request - No token found, request will be unauthenticated');
        }
      }
      return config;
    });
    
    // Add response interceptor to handle common error cases
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('API Client: Received 401 Unauthorized response');
          
          // Handle unauthorized access - clear token
          try {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            console.log('API Client: Cleared token and user from sessionStorage');
            
            // Also clear from cookies
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            console.log('API Client: Cleared token from cookies');
          } catch (e) {
            console.error('API Client: Error clearing auth data:', e);
          }
          
          // Only redirect to login if not already on auth pages
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
          
          if (!isAuthPage) {
            console.log('API Client: Redirecting to login page');
            // Only redirect if not already on an auth page
            // We need to use a soft redirect that doesn't reload the page
            // but this requires routing context from a component
            // Using location.replace is slightly better than location.href
            // as it doesn't add to browser history
            window.location.replace('/login');
          }
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
    // Extract the items array from the paginated response
    return response.data.items;
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

  // Get notes by user ID (for admin to view a specific user's notes)
  async getNotesByUserId(userId: number, skip = 0, limit = 100, search?: string): Promise<PaginatedNoteResponse> {
    let url = `/api/v1/notes/by-user/${userId}?skip=${skip}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await this.axiosInstance.get(url);
    return response.data;
  }

  // Admin methods
  async getUsers(page = 1, size = 10, role?: string, isActive?: boolean): Promise<PaginatedUserResponse> {
    let url = `/api/v1/admin/users/?page=${page}&size=${size}`;
    
    if (role) {
      url += `&role=${role}`;
    }
    
    if (isActive !== undefined) {
      url += `&is_active=${isActive}`;
    }
    
    const response = await this.axiosInstance.get(url);
    return response.data;
  }
  
  async getUserDetails(userId: number): Promise<UserResponse> {
    const response = await this.axiosInstance.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  }
  
  async updateUserRole(userId: number, role: string): Promise<UserResponse> {
    const roleData: UserUpdateRole = { role };
    const response = await this.axiosInstance.put(`/api/v1/admin/users/${userId}/role`, roleData);
    return response.data;
  }
  
  async updateUserStatus(userId: number, isActive: boolean): Promise<UserResponse> {
    const statusData: UserUpdateStatus = { is_active: isActive };
    const response = await this.axiosInstance.put(`/api/v1/admin/users/${userId}/status`, statusData);
    return response.data;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
