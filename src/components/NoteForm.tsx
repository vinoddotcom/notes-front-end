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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Title *</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          maxLength={200}
          className="input input-bordered w-full"
          required
        />
      </div>
      
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Note description (optional)"
          rows={4}
          className="textarea textarea-bordered w-full"
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Note' : 'Create Note'}
        </button>
      </div>
    </form>
  );
}
