# DocFlow

A lightweight collaborative document editor built for the Ajaia.ai AI Native Full Stack Developer hiring assessment.

## What It Is

DocFlow lets two mock users (Alice and Bob) create, edit, and share rich-text documents. Documents persist across refresh using SQLite.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Tiptap |
| Backend | Node.js, Express, TypeScript |
| Database | Prisma ORM, SQLite |
| Testing | Vitest (integration tests) |

## Features

- **Create documents** — new document with default title
- **Rename documents** — click the title to edit inline
- **Edit documents** — rich text editor with formatting toolbar
- **Save documents** — explicit save button or Ctrl+S
- **Rich text** — Bold, Italic, Underline, H1/H2/H3, Bullet lists, Numbered lists
- **File upload** — `.txt` and `.md` files become editable documents
- **Sharing** — share documents with the other mock user
- **My Documents** — view documents you own
- **Shared With Me** — view documents shared with you
- **User switcher** — toggle between Alice and Bob in the sidebar

## Running Locally

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd main/server
npm install
npm run db:push      # create SQLite database
npm run db:seed      # seed Alice and Bob
npm run dev          # start on http://localhost:3001
```

### Frontend

```bash
cd main/client
npm install
npm run dev          # start on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173).

### Running Tests

With the backend running:

```bash
cd main/server
npm test
```

## Deployment

### Frontend — Vercel

1. Connect your GitHub repo to Vercel
2. Set root directory to `main/client`
3. Add environment variable: `VITE_API_URL` = your Railway backend URL
4. Deploy

### Backend — Railway

1. Connect your GitHub repo to Railway
2. Set root directory to `main/server`
3. Add environment variable: `DATABASE_URL` = `file:./dev.db`
4. Set start command: `npm start`
5. Add a persistent volume mounted at `/app/prisma`
6. After first deploy, run: `npm run db:push && npm run db:seed`

## Project Structure

```
main/
├── client/          # Vite + React frontend
│   └── src/
│       ├── components/   # UI components
│       └── lib/          # API client, user context
├── server/          # Express backend
│   ├── prisma/      # Schema + seed
│   └── src/
│       ├── routes/  # API route handlers
│       └── __tests__/  # Vitest integration tests
├── README.md
├── ARCHITECTURE.md
├── AI_WORKFLOW.md
└── SUBMISSION.md
```

## Mock Users

| User | Name | Email |
|------|------|-------|
| user-1 | Alice Chen | alice@example.com |
| user-2 | Bob Park | bob@example.com |

Switch between users using the sidebar. No authentication required.
