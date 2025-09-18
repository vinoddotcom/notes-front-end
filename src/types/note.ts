// Note related types

export interface NoteCreate {
  title: string;
  description?: string | null;
}

export interface NoteUpdate {
  title?: string | null;
  description?: string | null;
}

export interface NoteResponse {
  title: string;
  description?: string | null;
  id: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
}
