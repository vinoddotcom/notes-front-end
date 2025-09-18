'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NoteResponse, UserResponse, NoteUpdate } from '@/services/apiClient';
import { NoteService } from '@/services/noteService';
import { AdminService } from '@/services/adminService';
import AdminGuard from '@/components/AdminGuard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface NoteEditPageProps {
  params: Promise<{
    userId: string;
    noteId: string;
  }>;
}

export default function NoteEditPage({ params }: NoteEditPageProps) {
  const router = useRouter();
  // Access params directly in client components
  const resolvedParams = React.use(params) as { userId: string; noteId: string };
  const userId = parseInt(resolvedParams.userId, 10);
  const noteId = parseInt(resolvedParams.noteId, 10);
  
  const [user, setUser] = useState<UserResponse | null>(null);
  const [note, setNote] = useState<NoteResponse | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNaN(userId) || isNaN(noteId)) {
      setError('Invalid user ID or note ID');
      setIsLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch user details
        const userDetails = await AdminService.getUserDetails(userId);
        setUser(userDetails);
        
        // Fetch note details
        const noteDetails = await NoteService.getNoteById(noteId);
        setNote(noteDetails);
        setTitle(noteDetails.title);
        setDescription(noteDetails.description || '');
        
        // Verify that the note belongs to the user
        if (noteDetails.owner_id !== userId) {
          setError(`This note does not belong to user ${userDetails.name}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, noteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSaving || !note) return;
    
    setIsSaving(true);
    setError('');
    
    try {
      const updateData: NoteUpdate = {
        title: title.trim(),
        description: description.trim() || null
      };
      
      await NoteService.updateNote(noteId, updateData);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'toast toast-top toast-center';
      successMessage.innerHTML = `
        <div class="alert alert-success">
          <span>Note updated successfully</span>
        </div>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
      
      // Navigate back to the user's notes page
      router.push(`/admin/users/${userId}/notes`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      setIsSaving(false);
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href={`/admin/users/${userId}/notes`} className="btn btn-ghost btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Notes
          </Link>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            {isLoading ? "Loading..." : "Edit Note"}
          </h1>
          
          {user && (
            <p className="text-base-content/60 mb-6">
              Note by {user.name} &middot; {user.email}
            </p>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Error</h3>
                <div className="text-xs">{error}</div>
              </div>
              <button className="btn btn-sm btn-circle" onClick={() => setError('')}>✕</button>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="mt-4 text-base-content/70">Loading note...</p>
            </div>
          ) : note ? (
            <form onSubmit={handleSubmit} className="bg-base-100 rounded-box shadow-lg p-6 border border-base-200">
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">Title</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
                  className="input input-bordered w-full"
                  required
                />
                <div className="text-xs text-right mt-1 text-base-content/60">
                  {title.length}/200 characters
                </div>
              </div>
              
              <div className="form-control w-full mb-6">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Note description"
                  className="textarea textarea-bordered w-full min-h-[150px]"
                  rows={8}
                />
                {description && (
                  <div className="text-xs text-right mt-1 text-base-content/60">
                    {description.length} characters
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/users/${userId}/notes`)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving || !title.trim()}
                >
                  {isSaving ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
              
              <div className="mt-8 pt-4 border-t border-base-200">
                <p className="text-xs text-base-content/60">
                  Last updated: {note && new Date(note.updated_at).toLocaleString()}
                </p>
              </div>
            </form>
          ) : (
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Note not found or access denied.</span>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
