'use client';

import { useState } from 'react';
import { NoteResponse } from '@/services/apiClient';

interface NoteCardProps {
  note: NoteResponse;
  onEdit: (note: NoteResponse) => void;
  onDelete: (noteId: number) => void;
  style?: React.CSSProperties;
}

export default function NoteCard({ note, onEdit, onDelete, style }: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(note.updated_at).toLocaleDateString();

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      onDelete(note.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className="card w-full bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border border-base-200 overflow-hidden group h-full"
      style={style}
    >
      <div className="card-body p-5">
        <div className="flex flex-col h-full">
          {/* Note Title */}
          <h2 className="card-title text-lg font-medium mb-2 line-clamp-2">{note.title}</h2>
          
          {/* Note Description */}
          <div className="mt-1 text-sm whitespace-pre-wrap line-clamp-8 flex-grow">
            {note.description || <span className="text-base-content/50 italic">No description</span>}
          </div>
          
          {/* Note Footer */}
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-base-200">
            <div className="text-xs text-base-content/60 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={() => onEdit(note)} 
                className="btn btn-circle btn-xs btn-ghost tooltip tooltip-left hover:bg-primary/10"
                data-tip="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="btn btn-circle btn-xs btn-ghost text-error tooltip tooltip-left hover:bg-error/10"
                data-tip="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
