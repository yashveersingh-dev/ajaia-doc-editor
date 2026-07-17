# DocFlow — Architecture

## Overview

DocFlow is a lightweight document editor with a simple 3-layer architecture: React frontend, Express REST API, and SQLite database via Prisma ORM.

```
┌────────────────────────────────────────┐
│  Frontend (Vite + React)               │
│  Port 5173  ·  Deployed: Vercel        │
└──────────────────┬─────────────────────┘
                   │ HTTP REST (proxied in dev)
                   ▼
┌────────────────────────────────────────┐
│  Backend (Express + TypeScript)        │
│  Port 3001  ·  Deployed: Railway       │
└──────────────────┬─────────────────────┘
                   │ Prisma ORM
                   ▼
┌────────────────────────────────────────┐
│  Database (SQLite)                     │
│  prisma/dev.db  ·  3 tables            │
└────────────────────────────────────────┘
```

## Database Schema

```
User
  id        String  (PK, uuid)
  name      String
  email     String  (unique)
  createdAt DateTime

Document
  id        String  (PK, uuid)
  title     String
  content   String  (Tiptap JSON or HTML marker)
  ownerId   String  (FK → User)
  createdAt DateTime
  updatedAt DateTime

DocumentShare
  id          String  (PK, uuid)
  documentId  String  (FK → Document, cascade delete)
  userId      String  (FK → User)
  ──────────────────────────────
  UNIQUE (documentId, userId)
```

## API Endpoints

### Documents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/documents` | required | List all accessible documents |
| POST | `/api/documents` | required | Create document |
| GET | `/api/documents/:id` | required | Get single document |
| PUT | `/api/documents/:id` | required | Update title/content |
| DELETE | `/api/documents/:id` | owner only | Delete document |

### Sharing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/documents/:id/share` | owner only | Share with user |
| GET | `/api/documents/:id/shares` | required | List shares |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/current` | Get current user |

**Auth:** All protected endpoints require `X-User-Id` header (mock auth — no JWT/OAuth).

## Frontend Component Hierarchy

```
App (BrowserRouter + UserProvider)
└── Layout
    ├── Sidebar
    │   ├── NavLinks (My Documents / Shared With Me)
    │   └── UserSwitcher (Alice ↔ Bob)
    └── Outlet (active route)
        ├── /              → DocumentList (view="mine")
        ├── /shared        → DocumentList (view="shared")
        └── /doc/:id       → DocumentEditor
                               ├── EditorToolbar
                               ├── Tiptap (EditorContent)
                               └── ShareDialog (modal)
```

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| Explicit save button | Simpler than autosave; satisfies "Save document" requirement without debounce complexity |
| Tiptap StarterKit | One import gives bold, italic, headings, lists. Underline added separately |
| `X-User-Id` header | Simplest mock auth — no JWT, no sessions, satisfies assessment requirement |
| Frontend-only file parsing | .txt/.md files never hit the server as files; parsed in browser, stored as JSON |
| SQLite | Zero config for local dev and Railway; correct choice for a demo |
| Vite proxy | Avoids CORS in dev; clean switch to env var in production |
| `marked` for markdown | Battle-tested, ~20KB, no parser to maintain |

## Content Storage

Tiptap documents are stored as JSON strings in the `content` column.

```
Normal doc:  '{"type":"doc","content":[...]}'
Empty doc:   '{}'
Uploaded .md: '{"__html":"<h1>Title</h1><p>...</p>"}'  ← parsed by editor on load
Uploaded .txt: '{"type":"doc","content":[{"type":"paragraph",...}]}'
```

## Sharing Model

- Owner can share with any other user
- Shared user gets full edit access
- Only the owner can delete or share
- "Shared With Me" = documents where `ownerId !== currentUserId` but a share record exists

## File Upload Flow

```
User picks file
  → FileReader.readAsText()
  → .md:  marked(text) → HTML → stored as { __html: "..." }
  → .txt: split lines → Tiptap paragraph nodes
  → POST /api/documents { title, content }
  → navigate to /doc/:newId
```

## What Is NOT Built

- Authentication / OAuth / JWT
- Realtime collaboration / WebSockets / CRDT
- Comments, suggestions, notifications
- Search, tags, templates, version history
- Complex permission roles
