import { apiClient, UserResponse, PaginatedUserResponse } from './apiClient';
import axios, { AxiosError } from 'axios';

export const AdminService = {
  // Get all users with optional filtering and pagination
  async getUsers(page = 1, size = 10, role?: string, isActive?: boolean): Promise<PaginatedUserResponse> {
    try {
      return await apiClient.getUsers(page, size, role, isActive);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        if (axiosError.response?.status === 403) {
          throw new Error('You do not have permission to view users. Admin access required.');
        }
        throw new Error(axiosError.response?.data?.detail || 'Failed to fetch users');
      }
      throw new Error('Failed to fetch users');
    }
  },

  // Get detailed information about a specific user
  async getUserDetails(userId: number): Promise<UserResponse> {
    try {
      return await apiClient.getUserDetails(userId);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        if (axiosError.response?.status === 403) {
          throw new Error('You do not have permission to view user details. Admin access required.');
        } else if (axiosError.response?.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(axiosError.response?.data?.detail || 'Failed to fetch user details');
      }
      throw new Error('Failed to fetch user details');
    }
  },

  // Update a user's role (admin/user)
  async updateUserRole(userId: number, role: string): Promise<UserResponse> {
    try {
      // Validate role input
      if (role !== 'admin' && role !== 'user') {
        throw new Error('Invalid role. Role must be either "admin" or "user".');
      }
      
      return await apiClient.updateUserRole(userId, role);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        if (axiosError.response?.status === 403) {
          throw new Error('You do not have permission to update user roles. Admin access required.');
        } else if (axiosError.response?.status === 404) {
          throw new Error('User not found');
        } else if (axiosError.response?.status === 400) {
          throw new Error(axiosError.response?.data?.detail || 'Cannot update role');
        }
        throw new Error(axiosError.response?.data?.detail || 'Failed to update user role');
      }
      throw new Error('Failed to update user role');
    }
  },

  // Update a user's active status
  async updateUserStatus(userId: number, isActive: boolean): Promise<UserResponse> {
    try {
      return await apiClient.updateUserStatus(userId, isActive);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        if (axiosError.response?.status === 403) {
          throw new Error('You do not have permission to update user status. Admin access required.');
        } else if (axiosError.response?.status === 404) {
          throw new Error('User not found');
        } else if (axiosError.response?.status === 400) {
          throw new Error(axiosError.response?.data?.detail || 'Cannot update user status');
        }
        throw new Error(axiosError.response?.data?.detail || 'Failed to update user status');
      }
      throw new Error('Failed to update user status');
    }
  }
};
