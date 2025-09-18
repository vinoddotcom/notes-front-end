'use client';

import { useState } from 'react';
import { NoteCreate, NoteResponse, NoteUpdate } from '@/services/apiClient';

interface NoteFormProps {
  initialData?: NoteResponse;
  onSubmit: (data: NoteCreate | NoteUpdate) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function NoteForm({ initialData, onSubmit, onCancel, isSubmitting }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const data: NoteCreate | NoteUpdate = {
      title: title.trim(),
      description: description.trim() || null
    };

    try {
      await onSubmit(data);
      // Form will be unmounted on successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert alert-error shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <div className="form-control w-full">
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          maxLength={200}
          className="input input-lg w-full font-medium focus:input-primary transition-all duration-300 bg-base-100 border-base-200"
          required
          autoFocus
        />
        <div className="text-xs text-right mt-1 text-base-content/60">
          {title.length}/200 characters
        </div>
      </div>
      
      <div className="form-control w-full">
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Take a note..."
          rows={6}
          className="textarea textarea-bordered w-full min-h-[150px] bg-base-100 border-base-200 focus:border-primary transition-all duration-300 resize-y"
        />
        {description && (
          <div className="text-xs text-right mt-1 text-base-content/60">
            {description.length} characters
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-base-200">
        <div className="text-sm text-base-content/70">
          {initialData ? 'Editing note...' : 'Creating new note...'}
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-sm btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm btn-primary"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : initialData ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}
