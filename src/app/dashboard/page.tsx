'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NoteCreate, NoteResponse, NoteUpdate } from '@/services/apiClient';
import { NoteService } from '@/services/noteService';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import NoteCard from '@/components/NoteCard';
import NoteForm from '@/components/NoteForm';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, refreshUserData, lastRefresh } = useAuth();
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userRole = user?.role || 'user';

  // Load notes when authentication is complete
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      // Check if we need to refresh user data
      const now = Date.now();
      const needsRefresh = (!user || !user.role) && (!lastRefresh || now - lastRefresh > 5000);
      
      if (needsRefresh) {
        console.log("Dashboard: Refreshing user data");
        refreshUserData()
          .then(() => fetchNotes())
          .catch((error: Error) => {
            console.error("Failed to refresh user data:", error);
            setError("Failed to load user data. Please try refreshing the page.");
          });
      } else {
        // Otherwise, just fetch notes
        console.log("Dashboard: User data already available, just fetching notes");
        fetchNotes();
      }
    }
  // Deliberately excluding refreshUserData from dependencies to prevent loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading, router, user]);
  
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

  const fetchNotes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const fetchedNotes = await NoteService.getNotes();
      console.log('Fetched notes:', fetchedNotes);
      setNotes(fetchedNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (noteData: NoteCreate | NoteUpdate) => {
    setIsSubmitting(true);
    try {
      // Ensure title is not null/undefined for create operation
      if (!noteData.title) {
        throw new Error("Title is required");
      }

      const createData: NoteCreate = {
        title: noteData.title,
        description: noteData.description
      };
      
      const newNote = await NoteService.createNote(createData);
      setNotes([newNote, ...notes]);
      setShowCreateForm(false);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async (noteData: NoteCreate | NoteUpdate) => {
    if (!editingNote) return;
    
    setIsSubmitting(true);
    try {
      const updateData: NoteUpdate = {
        title: noteData.title,
        description: noteData.description
      };
      
      const updatedNote = await NoteService.updateNote(editingNote.id, updateData);
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
      setEditingNote(null);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await NoteService.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header and Actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold">
              {userRole === 'admin' ? 'All Notes' : 'My Notes'}
            </h1>
            
            {userRole === 'admin' && (
              <button 
                onClick={() => router.push('/admin/users')}
                className="btn btn-sm btn-outline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Manage Users
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!showCreateForm && !editingNote && (
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
            )}
            
            <button 
              onClick={() => setShowCreateForm(true)} 
              className="btn btn-primary shadow-md hover:shadow-lg transition-all duration-300"
              disabled={showCreateForm || !!editingNote}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Note
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error shadow-lg mb-6 max-w-3xl mx-auto">
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

        {/* Create/Edit Note Form */}
        {(showCreateForm || editingNote) && (
          <div className="bg-base-100 rounded-box shadow-lg p-6 mb-8 max-w-3xl mx-auto border border-base-200">
            <NoteForm 
              initialData={editingNote || undefined}
              onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingNote(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 text-base-content/70">Loading your notes...</p>
          </div>
        ) : (
          /* Notes Grid Layout */
          <div className="masonry-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onEdit={setEditingNote}
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
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xl font-medium text-base-content/70 mt-4">No notes found</p>
                <p className="text-base-content/50 mb-8">Create your first note to get started!</p>
                <button 
                  onClick={() => setShowCreateForm(true)} 
                  className="btn btn-primary btn-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Your First Note
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
