'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NoteResponse, UserResponse } from '@/services/apiClient';
import { NoteService } from '@/services/noteService';
import { AdminService } from '@/services/adminService';
import AdminGuard from '@/components/AdminGuard';
import Navbar from '@/components/Navbar';
import NoteCard from '@/components/NoteCard';
import Link from 'next/link';

interface UserNotesPageProps {
  params: {
    userId: string;
  };
}

export default function UserNotesPage({ params }: UserNotesPageProps) {
  const router = useRouter();
  const userId = parseInt(params.userId, 10);
  
  const [user, setUser] = useState<UserResponse | null>(null);
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (isNaN(userId)) {
      setError('Invalid user ID');
      setIsLoading(false);
      return;
    }
    
    const fetchUserAndNotes = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch user details
        const userDetails = await AdminService.getUserDetails(userId);
        setUser(userDetails);
        
        // Fetch all notes as admin
        const allNotes = await NoteService.getNotes();
        
        // Filter notes that belong to this user
        const userNotes = allNotes.filter(note => note.owner_id === userId);
        setNotes(userNotes);
        setFilteredNotes(userNotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndNotes();
  }, [userId]);
  
  // Filter notes based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        (note.description && note.description.toLowerCase().includes(query))
      );
      setFilteredNotes(filtered);
    }
  }, [notes, searchQuery]);
  
  const handleDeleteNote = async (noteId: number) => {
    try {
      await NoteService.deleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'toast toast-top toast-center';
      successMessage.innerHTML = `
        <div class="alert alert-success">
          <span>Note deleted successfully</span>
        </div>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin/users" className="btn btn-ghost btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Users
              </Link>
            </div>
            <h1 className="text-3xl font-bold">
              {isLoading 
                ? "Loading..." 
                : user 
                  ? `Notes for ${user.name}` 
                  : "User Notes"
              }
            </h1>
            {user && (
              <p className="text-base-content/60">
                {user.email} &middot; {user.role}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="join bg-base-200 rounded-full overflow-hidden transition-all hover:shadow-md focus-within:shadow-md focus-within:bg-base-100 border border-base-200">
              <div className="px-3 flex items-center text-base-content/60 join-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..." 
                className="input border-0 bg-transparent focus:outline-none join-item w-52" 
              />
              {searchQuery && (
                <button 
                  className="btn btn-ghost btn-sm join-item rounded-r-full"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-6 max-w-3xl mx-auto">
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
            <p className="mt-4 text-base-content/70">Loading notes...</p>
          </div>
        ) : (
          /* Notes Grid Layout */
          <div className="masonry-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onEdit={(note) => router.push(`/admin/users/${userId}/notes/${note.id}`)}
                  onDelete={handleDeleteNote}
                  style={{
                    height: note.description && note.description.length > 100 ? 
                      'auto' : undefined
                  }}
                />
              ))
            ) : searchQuery ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg text-base-content/70 mt-4">No notes matching &ldquo;{searchQuery}&rdquo;</p>
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="btn btn-outline btn-sm mt-4"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xl font-medium text-base-content/70 mt-4">No notes found for this user</p>
                <p className="text-base-content/50 mb-4">This user hasn&apos;t created any notes yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
