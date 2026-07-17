# AI Workflow

This document describes how AI tools were used during the development of DocFlow.

## Role of AI in This Project

AI (Antigravity / Gemini) acted as a **pair programmer and senior engineer advisor** throughout this assessment. The collaboration was intentional and transparent.

## How AI Was Used

### 1. Architecture Planning

The AI produced the initial architecture document (`notes/ARCHITECTURE.md`) covering:
- System diagram
- Database schema
- API endpoint design
- Component hierarchy
- Milestone breakdown
- Risk register

This gave a structured plan to work from, avoiding wasted effort on wrong abstractions.

### 2. Code Generation

The AI wrote the majority of the code, including:
- Express route handlers (`documents.ts`, `shares.ts`, `users.ts`)
- Prisma schema and seed script
- React components (Layout, Sidebar, DocumentList, DocumentEditor, ShareDialog, FileUpload, EditorToolbar)
- Typed API client (`lib/api.ts`)
- Tiptap editor integration
- Vitest integration tests

Every file was reviewed for correctness before being accepted.

### 3. Bug Detection and Fixing

During build verification, the AI caught and fixed:
- TypeScript error: `import.meta.env` not typed — fixed by adding `"types": ["vite/client"]` to tsconfig
- Build error: `require()` in ESM context — fixed by switching to top-level `import { marked }`
- PowerShell `curl` alias confusion — switched to `Invoke-RestMethod` for health checks

### 4. Test Writing

The AI wrote 20 integration tests covering:
- Health endpoint
- User endpoints (both users, missing header validation)
- Document CRUD (create, read, update, delete)
- Access control (403 for non-owners, 400 for missing headers)
- Sharing (success, self-share rejection, non-owner rejection)

All 20 tests pass.

### 5. Documentation

The AI generated README.md, ARCHITECTURE.md, AI_WORKFLOW.md, and SUBMISSION.md.

## What the Human Did

- Defined the requirements and assessment constraints
- Reviewed every generated artifact before accepting
- Made the final call on architectural tradeoffs
- Approved milestones before proceeding to the next
- Directed the workflow and sequencing

## Engineering Philosophy Applied

The AI was instructed to behave like a **senior engineer with limited time** — always asking:
- Is this required?
- Can this be simpler?
- Would a senior engineer under a deadline actually build this?

This kept the codebase minimal, focused, and production-quality without scope creep.
