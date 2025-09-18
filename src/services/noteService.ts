import { apiClient, NoteCreate, NoteResponse, NoteUpdate } from './apiClient';
import axios, { AxiosError } from 'axios';

export const NoteService = {
  // Get all notes (or only user's notes based on role)
  async getNotes(skip = 0, limit = 100): Promise<NoteResponse[]> {
    try {
      return await apiClient.getNotes(skip, limit);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        throw new Error(axiosError.response?.data?.detail || 'Failed to fetch notes');
      }
      throw new Error('Failed to fetch notes');
    }
  },

  // Get a specific note by ID
  async getNoteById(noteId: number): Promise<NoteResponse> {
    try {
      return await apiClient.getNoteById(noteId);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        throw new Error(axiosError.response?.data?.detail || 'Failed to fetch note');
      }
      throw new Error('Failed to fetch note');
    }
  },

  // Create a new note
  async createNote(note: NoteCreate): Promise<NoteResponse> {
    try {
      return await apiClient.createNote(note);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        throw new Error(axiosError.response?.data?.detail || 'Failed to create note');
      }
      throw new Error('Failed to create note');
    }
  },

  // Update an existing note
  async updateNote(noteId: number, note: NoteUpdate): Promise<NoteResponse> {
    try {
      return await apiClient.updateNote(noteId, note);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        throw new Error(axiosError.response?.data?.detail || 'Failed to update note');
      }
      throw new Error('Failed to update note');
    }
  },

  // Delete a note
  async deleteNote(noteId: number): Promise<void> {
    try {
      await apiClient.deleteNote(noteId);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        throw new Error(axiosError.response?.data?.detail || 'Failed to delete note');
      }
      throw new Error('Failed to delete note');
    }
  }
};
