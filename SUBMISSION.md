# Submission Checklist

## Project Summary
A production-quality MVP for a collaborative document editor. Built with a focus on clean architecture, simplicity, and engineering quality. The application supports document creation, editing, sharing, and file uploads using a mock user system to satisfy assessment constraints without unnecessary overhead.

## Live Deployments
- **Frontend (Vercel)**: [https://client-ten-beta-53.vercel.app](https://client-ten-beta-53.vercel.app)
- **Backend (Railway)**: [https://server-production-74ad.up.railway.app](https://server-production-74ad.up.railway.app)
- **Repository (GitHub)**: [https://github.com/yashveersingh-dev/ajaia-doc-editor](https://github.com/yashveersingh-dev/ajaia-doc-editor)

## Implemented Features
- [x] Document creation and listing
- [x] Rich text editing (Tiptap headless editor)
- [x] File upload and parsing (`.txt`, `.md`)
- [x] Secure document sharing (READ / WRITE permissions)
- [x] Fast, decoupled Client/Server architecture
- [x] Pre-seeded SQLite database 

## Included Documentation
- [x] `README.md` (Project overview and setup)
- [x] `ARCHITECTURE.md` (System design and decisions)
- [x] `AI_WORKFLOW.md` (Agentic AI collaboration details)
- [x] `SUBMISSION.md` (This checklist)

## Test Users
The backend API is pre-seeded with these users. Switch between them instantly via the frontend UI to test sharing.
- **Alice Chen** (`alice@example.com`)
- **Bob Park** (`bob@example.com`)

## Supported Uploads
- Text files (`.txt`)
- Markdown files (`.md`)

## Automated Testing
- [x] Comprehensive API integration tests (`vitest` + `supertest`) passing successfully.

## Known Limitations
- SQLite is ephemeral on Railway, meaning the database resets and re-seeds on every redeployment. (A persistent volume can be attached in production).
- No real-time collaborative cursors (CRDTs). Concurrency relies on standard API overrides.
- Authentication relies on the mock `X-User-Id` header rather than JWTs/OAuth.

## Future Roadmap (With More Time)
1. Implement real-time WebSockets with Yjs for true multi-player editing.
2. Integrate an OAuth provider (e.g., Clerk or Auth0) and JWT validation.
3. Migrate to a managed PostgreSQL database (e.g., Supabase) for robust persistence and connection pooling.
