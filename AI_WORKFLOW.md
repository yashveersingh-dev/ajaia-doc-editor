# AI Workflow

This document details how AI assistance was leveraged during the development of this project, highlighting where it accelerated progress while maintaining strict engineering judgment.

## AI Tools Used

- **Google Gemini (Antigravity IDE)**: Served as the primary agentic pair programmer for scaffolding, refactoring, code generation, and deployment orchestration.

## Where AI Accelerated Development

- **Scaffolding and Boilerplate**: AI rapidly generated the initial Express server, Vite React application, and Prisma schema configurations, saving hours of manual setup.
- **Component Styling**: AI quickly generated polished, minimalist Tailwind CSS layouts for the document editor and sidebar, ensuring a premium "wow" factor out-of-the-box.
- **Error Resolution**: When encountering a `PayloadTooLargeError` due to Express' default 100kb limit, AI instantly identified the root cause and provided the 10mb limit fix.
- **Deployment Orchestration**: AI assisted in configuring Git remotes, running Vercel CLI commands, and navigating Railway's deployment nuances.

## What AI Suggestions Were Rejected or Modified

- **Over-engineering**: AI occasionally suggested adding heavy collaborative frameworks (like Yjs/WebSockets) or full OAuth authentication. These were strictly rejected to adhere to the MVP scope and simplicity constraints.
- **Database Configuration**: AI initially configured the Prisma `updatedAt` field using `@default(now())`, which meant the timestamp wouldn't update on edits. I recognized this flaw and instructed the AI to use `@updatedAt` instead.
- **CORS Misconfiguration**: During deployment, AI attempted to pass a raw comma-separated string to the Express `cors()` middleware. I verified the browser console errors and guided the AI to parse the string into an array, adhering to CORS specification requirements.

## Manual Debugging Performed

- **Memory Leak Prevention**: Discovered a missing dependency array in a `useEffect` hook handling the `Ctrl+S` keyboard shortcut, which would have caused rampant event listener duplication.
- **Deployment Environment Diagnostics**: Investigated Railway's ephemeral file system behavior to determine that SQLite required a boot-time migration and seed step (`npm run db:push && npm run db:seed`) to function correctly in the cloud.

## Manual Verification Process

After every major milestone, a strict manual verification process was enforced:
1. `npm install` and `npm run dev` were executed locally.
2. REST API endpoints were manually queried (e.g., `/api/health`, `/api/users/current`).
3. Frontend and backend proxies were tested.
4. Final deployments were tested comprehensively in the browser to ensure CORS and production builds functioned flawlessly.

## Testing Performed

- **Integration Tests**: Automated API integration tests using Vitest and Supertest to validate endpoints, permissions, and database constraints.
- **End-to-End Test**: Executed live `POST` and `OPTIONS` requests against the deployed Railway API to guarantee production networking stability.

## Lessons Learned

- **AI Needs Boundaries**: AI is incredibly powerful at generating code but requires strict, unwavering boundaries (like "Never optimize for showing off") to prevent scope creep.
- **Trust but Verify**: AI can generate completely correct code that fails in production due to environmental differences (like Railway's ephemeral disk or Express' specific CORS array requirements). Human oversight remains the ultimate gatekeeper of quality.
