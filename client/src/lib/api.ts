// API base URL — uses Vite proxy in dev, env var in production
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Share {
  id: string;
  documentId: string;
  userId: string;
  user: User;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: User;
  shares: Share[];
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function request<T>(
  method: string,
  path: string,
  userId: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `API error ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.error ?? message;
    } catch {
      // plain text error
    }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const getUsers = (userId: string) =>
  request<User[]>('GET', '/api/users', userId);

export const getCurrentUser = (userId: string) =>
  request<User>('GET', '/api/users/current', userId);

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const getDocuments = (userId: string) =>
  request<Document[]>('GET', '/api/documents', userId);

export const getDocument = (userId: string, id: string) =>
  request<Document>('GET', `/api/documents/${id}`, userId);

export const createDocument = (
  userId: string,
  data: { title: string; content?: string },
) => request<Document>('POST', '/api/documents', userId, data);

export const updateDocument = (
  userId: string,
  id: string,
  data: { title?: string; content?: string },
) => request<Document>('PUT', `/api/documents/${id}`, userId, data);

export const deleteDocument = (userId: string, id: string) =>
  request<void>('DELETE', `/api/documents/${id}`, userId);

// ---------------------------------------------------------------------------
// Shares
// ---------------------------------------------------------------------------

export const shareDocument = (
  userId: string,
  documentId: string,
  targetUserId: string,
) =>
  request<Share>('POST', `/api/documents/${documentId}/share`, userId, {
    userId: targetUserId,
  });

export const getShares = (userId: string, documentId: string) =>
  request<Share[]>('GET', `/api/documents/${documentId}/shares`, userId);
