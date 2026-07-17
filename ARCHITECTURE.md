# Architecture

This document outlines the architectural decisions and system design for the Ajaia DocFlow application.

## High-Level Architecture

The application is designed as a decoupled client-server architecture:
- **Client**: A Single Page Application (SPA) built with React and Vite.
- **Server**: A RESTful API built with Node.js and Express.
- **Database**: A relational database managed via Prisma ORM.

Communication between the client and server happens via standard HTTP REST endpoints using JSON payloads.

## Frontend Architecture

- **Framework**: React 18 with TypeScript for type safety.
- **Routing**: Minimal conditional rendering (or a lightweight router) to keep the SPA fast and simple.
- **Styling**: Tailwind CSS for rapid, consistent, and utility-first styling.
- **State Management**: React Context (`UserContext`) is used to mock the authenticated user globally. Local component state manages document editing and UI toggles.
- **API Layer**: Centralized API utility functions handle `fetch` calls, ensuring the `X-User-Id` header is consistently attached for mocking authentication.

## Backend Architecture

- **Framework**: Express.js with TypeScript.
- **Middleware**: Configured with CORS (allowing specific production and local origins) and extended JSON body parsers (`limit: '10mb'`) to accommodate large rich-text payloads.
- **Routing**: Modular Express routers (`/api/documents`, `/api/users`, etc.) for clear separation of concerns.
- **Context Injection**: A custom middleware injects the Prisma client into the Express request object (`req.context.prisma`) to avoid tight global coupling and make testing easier.

## Database Design

The database uses a relational model with the following core entities:
1. **User**: Represents a system user (`id`, `name`, `email`).
2. **Document**: Represents a rich text document (`id`, `title`, `content`, `ownerId`).
3. **Share**: A join table mapping a `Document` to a `User` with a specific `permission` level (`READ` or `WRITE`).

## API Structure

- `GET /api/users/current`: Mocks retrieving the currently authenticated user.
- `GET /api/users`: Retrieves all users (useful for populating the share dialog).
- `GET /api/documents`: Fetches all documents owned by or shared with the current user.
- `POST /api/documents`: Creates a new document.
- `GET /api/documents/:id`: Retrieves a single document by ID.
- `PUT /api/documents/:id`: Updates a document's title or content.
- `POST /api/documents/:id/share`: Shares a document with another user.

## Sharing Model

Permissions are verified at the API level:
- The `owner` of a document has implicit full control.
- Other users must have a valid `Share` record associated with the document.
- API endpoints strictly check the requester's `X-User-Id` against the document's ownership and share records before permitting reads or updates.

## Persistence Strategy

- **Database**: SQLite is used for simplicity, lightweight footprint, and zero-configuration setup during development and deployment.
- **Railway Considerations**: Because Railway's standard filesystem is ephemeral, the backend startup script (`npm start`) runs Prisma database pushes and seeding on boot to ensure the schema and mock users are immediately available.

## Rich Text Editor Choice

- **Tiptap**: Tiptap was chosen over Draft.js, Quill, or Slate because of its headless architecture. It provides robust, reliable rich-text mechanics while granting 100% control over the UI and styling via Tailwind CSS.

## Deployment Strategy

- **Frontend**: Deployed as a static site on **Vercel** for global CDN edge delivery and lightning-fast loading.
- **Backend**: Deployed as a Node container on **Railway** for seamless CI/CD and zero-downtime rollouts.
- **Environment Management**: Secrets and API URLs are managed strictly through Vercel and Railway dashboard variables, ensuring clean separation between code and configuration.

## Engineering Tradeoffs

1. **Mock Authentication**: Auth0/JWT was skipped in favor of a mock `X-User-Id` header. This drastically reduces complexity while still thoroughly proving permission logic and data ownership.
2. **SQLite vs PostgreSQL**: SQLite was chosen to eliminate database provisioning overhead. While PostgreSQL is better for heavy production concurrent writes, SQLite perfectly serves an MVP assessment.
3. **Polling vs WebSockets**: Real-time collaborative cursors (CRDTs) were intentionally excluded to maintain a simple, reliable, and testable MVP within scope.

## Future Improvements

- **Real-time Collaboration**: Integrate Yjs and WebSockets for live multiplayer editing.
- **True Authentication**: Replace the mock headers with JWTs and an OAuth provider.
- **Persistent Cloud Database**: Migrate from SQLite to a managed PostgreSQL instance on Supabase or Neon.
- **Pagination**: Implement cursor-based pagination on the document list for scale.
