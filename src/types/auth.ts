// Authentication related types

export interface UserCreate {
  email: string;
  name: string;
  password: string;
  role?: string; // default: "user"
}

export interface UserResponse {
  email: string;
  name: string;
  id: number;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string | null;
  client_secret?: string | null;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Error interfaces
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}
