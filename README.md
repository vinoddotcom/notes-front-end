# Notes Application

A Next.js application for managing personal notes with authentication, role-based access control, and a modern UI using DaisyUI and Tailwind CSS.

## Features

- **User Authentication**
  - Sign-up with name, email, password, and role (admin/user)
  - Sign-in with email and password
  - Protected routes for authenticated users

- **Notes Management**
  - Create, read, update, and delete notes
  - View all notes in a card layout
  - Role-based access control:
    - Admin: Can manage all notes
    - User: Can only manage their own notes

- **Modern UI**
  - Multiple themes using DaisyUI
  - Responsive design for all device sizes
  - Theme switcher in the navigation bar

## Technical Stack

- **Frontend**: Next.js with TypeScript
- **CSS Framework**: Tailwind CSS with DaisyUI
- **API Integration**: Axios with auto-generated TypeScript interfaces from OpenAPI schema
- **Authentication**: JWT token-based authentication

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Generate API types from the OpenAPI specification:

```bash
npm run generate-api
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

The application consumes an API from `https://api-notes.vinod.digital/` with the following endpoints:

- Authentication:
  - POST `/api/v1/auth/register` - Register a new user
  - POST `/api/v1/auth/login` - Login a user
  - GET `/api/v1/auth/me` - Get current user information

- Notes:
  - GET `/api/v1/notes/` - Get all notes (or only user's notes based on role)
  - GET `/api/v1/notes/{note_id}` - Get a specific note
  - POST `/api/v1/notes/` - Create a new note
  - PUT `/api/v1/notes/{note_id}` - Update a note
  - DELETE `/api/v1/notes/{note_id}` - Delete a note

## Project Structure

- `/src/app`: Next.js application routes
- `/src/components`: Reusable UI components
- `/src/services`: API service layer
- `/src/types`: TypeScript type definitions
- `/src/types/generated`: Auto-generated types from OpenAPI schema

## Theme Support

The application supports multiple themes from DaisyUI, which can be changed via the theme switcher in the navigation bar. Available themes include:

- Light
- Dark
- Cupcake
- Bumblebee
- Emerald
- Corporate
- Synthwave
- Retro
- Cyberpunk
- Night

User preferences for themes are stored in the browser's localStorage.
