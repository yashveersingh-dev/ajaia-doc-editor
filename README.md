# Ajaia DocFlow

A production-ready, lightweight collaborative document editor built for the Ajaia.ai AI Native Full Stack Developer assessment.

## About the Developer

Hi, I'm Yashveer Singh, founder of Yashveer Labs. I enjoy building AI-native products, full stack applications, and developer-focused software. This project was built as part of the Ajaia.ai AI-Native Full Stack Developer assessment.

## Features

- **Rich Text Editing**: Create, edit, and format documents with a polished, minimalist interface.
- **Document Management**: Create new documents, list existing ones, and save changes securely.
- **File Upload & Markdown Parsing**: Upload `.txt` and `.md` files directly into the editor for instant parsing.
- **Document Sharing**: Share documents with specific users with appropriate read/write permissions.
- **Mock User System**: Switch between different test users instantly without complex authentication overhead.
- **Production Ready**: Fully deployed with optimized asset delivery and secure CORS configuration.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: SQLite (Ephemeral on Railway, seeded on startup)
- **Editor**: Tiptap (Headless rich text framework)
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Local Setup

Follow these steps to run the application locally.

### 1. Install Dependencies

You must install dependencies for both the client and server.

```bash
# In the root directory (if using monorepo scripts) or individually:
cd server
npm install

cd ../client
npm install
```

### 2. Backend

```bash
cd server
# Start the backend development server (runs on port 3001 by default)
npm run dev
```

### 3. Frontend

```bash
cd client
# Create a .env file from .env.example if needed, then start Vite
npm run dev
```

*Note: The frontend runs on port 5173 by default and proxies `/api` requests to the backend.*

## Seeded Users

To test the sharing functionality, the database is pre-seeded with mock users. You can simulate being different users by changing the `X-User-Id` header (the frontend handles this transparently). 

**Available Mock Users:**
- **Alice Chen** (ID: `user-1`, Email: `alice@example.com`)
- **Bob Park** (ID: `user-2`, Email: `bob@example.com`)

## Deployment

- **Frontend (Live)**: [https://client-ten-beta-53.vercel.app](https://client-ten-beta-53.vercel.app)
- **Backend (API)**: [https://server-production-74ad.up.railway.app](https://server-production-74ad.up.railway.app)

## Supported Upload Types

The editor supports uploading and parsing the following file formats:
- **Text Files** (`.txt`)
- **Markdown Files** (`.md`)

## Project Structure

- `/client`: React frontend application built with Vite and Tailwind CSS.
- `/server`: Node.js/Express backend API and Prisma database configuration.
- `/Source Code`: The final submission folder containing all source code and required documentation.
