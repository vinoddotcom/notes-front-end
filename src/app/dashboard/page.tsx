'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NoteCreate, NoteResponse, NoteUpdate } from '@/services/apiClient';
import { NoteService } from '@/services/noteService';
import { AuthService } from '@/services/authService';
import Navbar from '@/components/Navbar';
import NoteCard from '@/components/NoteCard';
import NoteForm from '@/components/NoteForm';

export default function DashboardPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = AuthService.getCachedUser();
    if (userData) {
      setUserRole(userData.role);
    }
    
    fetchNotes();
  }, [router]);

  const fetchNotes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const fetchedNotes = await NoteService.getNotes();
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {userRole === 'admin' ? 'All Notes' : 'My Notes'}
          </h1>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="btn btn-primary"
            disabled={showCreateForm}
          >
            Create New Note
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create/Edit Note Form */}
            {(showCreateForm || editingNote) && (
              <div className="col-span-full bg-base-200 rounded-box p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </h2>
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

            {/* Notes List */}
            {notes.length > 0 ? (
              notes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onEdit={setEditingNote}
                  onDelete={handleDeleteNote}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg opacity-70">No notes found. Create your first note!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
