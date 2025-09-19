# Notes Application

A Next.js application for managing personal notes with authentication, role-based access control, and a modern UI using DaisyUI and Tailwind CSS.

## Live Demo

**Preview Link:** [https://notes.vinod.digital/](https://notes.vinod.digital/)

The application is hosted on Cloudflare Pages for optimal performance and reliability.

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

- **Frontend**: Next.js 15 with TypeScript and App Router
- **CSS Framework**: Tailwind CSS with DaisyUI for theming
- **API Integration**: 
  - Axios for API requests
  - Auto-generated TypeScript interfaces from OpenAPI/Swagger schema
  - Integration with backend via RESTful endpoints
- **Authentication**: JWT token-based authentication
- **Deployment**: Cloudflare Pages with Edge runtime

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Generate API types from the OpenAPI/Swagger specification:

```bash
npm run generate-api
```

   This script fetches the OpenAPI schema and generates TypeScript types in `/src/types/generated/api.ts`

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

The application consumes an API from `https://api-notes.vinod.digital/` with OpenAPI/Swagger integration:

- **Swagger UI:** [https://api-notes.vinod.digital/docs](https://api-notes.vinod.digital/docs)
- **OpenAPI JSON:** [https://api-notes.vinod.digital/openapi.json](https://api-notes.vinod.digital/openapi.json)

### Key API Endpoints:

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

- `/src/app`: Next.js application routes using App Router
- `/src/components`: Reusable UI components
- `/src/services`: API service layer with Axios integration
- `/src/context`: React context providers (e.g., AuthContext)
- `/src/types`: TypeScript type definitions
- `/src/types/generated`: Auto-generated types from OpenAPI/Swagger schema
- `/scripts`: Utility scripts including the OpenAPI type generator

## Theme Support

The application supports multiple themes from DaisyUI, which can be changed via the theme switcher in the navigation bar.

Key theme features:
- Light/Dark mode support
- Theme persistence using browser's localStorage
- DaisyUI integration for consistent styling

## OpenAPI/Swagger Integration

This project uses OpenAPI/Swagger for type-safe API integration:

1. The backend exposes an OpenAPI schema at `https://api-notes.vinod.digital/openapi.json`
2. The `scripts/generate-api-types.ts` script fetches this schema and generates TypeScript types
3. The generated types are used throughout the application to ensure type safety when working with API data

### How It Works:

- The `openapi-typescript` package converts the Swagger schema to TypeScript definitions
- The generated types provide full IntelliSense support for API requests and responses
- API services in `/src/services` use these types to ensure type-safe API calls
- The script attempts to fetch from the remote API, with a fallback to a local OpenAPI schema if the API is unavailable

## Deployment

The application is deployed on Cloudflare Pages:

- **Production URL:** [https://notes.vinod.digital/](https://notes.vinod.digital/)
- **Edge Runtime:** Used for optimal performance and global distribution
- **CI/CD:** Automatic deployments from the main branch

To deploy your own version:

1. Build the application:
```bash
npm run build
```

2. The built application can be deployed to any static hosting provider that supports Next.js, such as Cloudflare Pages, Vercel, or Netlify.
