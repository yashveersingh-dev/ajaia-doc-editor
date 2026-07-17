# Submission — DocFlow

## Candidate

Submitted for the **Ajaia.ai AI Native Full Stack Developer** hiring assessment.

## What Was Built

A production-ready lightweight collaborative document editor named **DocFlow**.

### Features Delivered

| Requirement | Status |
|-------------|--------|
| Create document | ✅ |
| Rename document | ✅ Click title to edit inline |
| Edit document | ✅ Tiptap rich text editor |
| Save document | ✅ Save button + Ctrl+S |
| Open existing document | ✅ |
| Bold | ✅ |
| Italic | ✅ |
| Underline | ✅ |
| Headings (H1, H2, H3) | ✅ |
| Bullet lists | ✅ |
| Numbered lists | ✅ |
| Upload .txt | ✅ |
| Upload .md | ✅ |
| Two mock users (Alice + Bob) | ✅ |
| My Documents | ✅ |
| Shared With Me | ✅ |
| Share document | ✅ |
| SQLite persistence | ✅ |
| Survives refresh | ✅ |
| README.md | ✅ |
| ARCHITECTURE.md | ✅ |
| AI_WORKFLOW.md | ✅ |
| SUBMISSION.md | ✅ |
| Validation + error handling | ✅ |
| Vitest tests (20 tests, all passing) | ✅ |

## How to Run Locally

```bash
# Backend
cd main/server
npm install
npm run db:push
npm run db:seed
npm run dev

# Frontend (separate terminal)
cd main/client
npm install
npm run dev
```

Open http://localhost:5173

## How to Run Tests

```bash
# Ensure backend is running, then:
cd main/server
npm test
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Tiptap
- **Backend:** Node.js, Express, TypeScript
- **Database:** Prisma ORM, SQLite
- **Testing:** Vitest (20 integration tests)

## Deployment

### Frontend → Vercel

- Root directory: `main/client`
- Build command: `npm run build`
- Environment variable: `VITE_API_URL` = Railway backend URL

### Backend → Railway

- Root directory: `main/server`
- Build command: `npm run build`
- Start command: `npm start`
- Environment variable: `DATABASE_URL` = `file:./prisma/dev.db`
- Persistent volume mounted at `/app/prisma` (to survive redeploys)
- Post-deploy: `npm run db:push && npm run db:seed`

## Architecture Summary

Single REST API, no WebSockets, no realtime, explicit save. The simplest architecture that fully satisfies every requirement.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.

## Engineering Notes

- No authentication — mock users via `X-User-Id` header per assessment spec
- No autosave — explicit Save button (simpler, required by spec)
- Frontend-only file parsing — .txt/.md read in browser, no file upload endpoint needed
- 20 integration tests covering all API endpoints and access control scenarios
- Zero TypeScript errors in both frontend and backend
