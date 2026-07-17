import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * Integration tests for the DocFlow REST API.
 *
 * These tests run against the live Express app with a real SQLite database
 * (seeded with two mock users). They test the actual HTTP layer including
 * validation, access control, and persistence.
 */

const BASE = 'http://localhost:3001';
const ALICE = 'user-1';
const BOB = 'user-2';

async function api(
  method: string,
  path: string,
  userId: string,
  body?: unknown,
): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json();
  return { status: res.status, data };
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json() as { status: string };
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
  });
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
describe('GET /api/users', () => {
  it('returns both mock users', async () => {
    const { status, data } = await api('GET', '/api/users', ALICE);
    expect(status).toBe(200);
    const users = data as Array<{ id: string; name: string }>;
    expect(users.length).toBeGreaterThanOrEqual(2);
    const ids = users.map((u) => u.id);
    expect(ids).toContain('user-1');
    expect(ids).toContain('user-2');
  });
});

describe('GET /api/users/current', () => {
  it('returns Alice when X-User-Id is user-1', async () => {
    const { status, data } = await api('GET', '/api/users/current', ALICE);
    expect(status).toBe(200);
    const user = data as { id: string; name: string };
    expect(user.id).toBe('user-1');
    expect(user.name).toBe('Alice Chen');
  });

  it('returns Bob when X-User-Id is user-2', async () => {
    const { status, data } = await api('GET', '/api/users/current', BOB);
    expect(status).toBe(200);
    const user = data as { id: string; name: string };
    expect(user.id).toBe('user-2');
    expect(user.name).toBe('Bob Park');
  });

  it('returns 400 when X-User-Id header is missing', async () => {
    const res = await fetch(`${BASE}/api/users/current`);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toMatch(/X-User-Id/i);
  });
});

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------
describe('POST /api/documents', () => {
  it('returns 400 when X-User-Id header is missing', async () => {
    const res = await fetch(`${BASE}/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is missing', async () => {
    const { status } = await api('POST', '/api/documents', ALICE, {});
    expect(status).toBe(400);
  });

  it('creates a document and returns 201', async () => {
    const { status, data } = await api('POST', '/api/documents', ALICE, {
      title: 'Test Document',
    });
    expect(status).toBe(201);
    const doc = data as { id: string; title: string; ownerId: string };
    expect(doc.title).toBe('Test Document');
    expect(doc.ownerId).toBe(ALICE);
    expect(doc.id).toBeTruthy();
  });
});

describe('GET /api/documents', () => {
  it('returns 400 when X-User-Id header is missing', async () => {
    const res = await fetch(`${BASE}/api/documents`);
    expect(res.status).toBe(400);
  });

  it('returns documents for the current user', async () => {
    // Create one document first
    await api('POST', '/api/documents', ALICE, { title: 'Alice Doc' });
    const { status, data } = await api('GET', '/api/documents', ALICE);
    expect(status).toBe(200);
    const docs = data as Array<{ ownerId: string }>;
    expect(Array.isArray(docs)).toBe(true);
    // All returned docs must be owned by or shared with Alice
    // (Alice's own docs have ownerId === ALICE)
    const aliceDocs = docs.filter((d) => d.ownerId === ALICE);
    expect(aliceDocs.length).toBeGreaterThan(0);
  });
});

describe('GET /api/documents/:id', () => {
  it('returns 403 when user has no access', async () => {
    // Alice creates a doc, Bob tries to access it
    const { data: created } = await api('POST', '/api/documents', ALICE, {
      title: 'Private Doc',
    });
    const doc = created as { id: string };
    const { status } = await api('GET', `/api/documents/${doc.id}`, BOB);
    expect(status).toBe(403);
  });

  it('returns 404 for non-existent document', async () => {
    const { status } = await api('GET', '/api/documents/non-existent-id', ALICE);
    expect(status).toBe(404);
  });

  it('returns the document for the owner', async () => {
    const { data: created } = await api('POST', '/api/documents', ALICE, {
      title: 'Fetch Me',
    });
    const doc = created as { id: string; title: string };
    const { status, data } = await api('GET', `/api/documents/${doc.id}`, ALICE);
    expect(status).toBe(200);
    const fetched = data as { title: string };
    expect(fetched.title).toBe('Fetch Me');
  });
});

describe('PUT /api/documents/:id', () => {
  it('updates title and content', async () => {
    const { data: created } = await api('POST', '/api/documents', ALICE, {
      title: 'Original',
    });
    const doc = created as { id: string };
    const { status, data } = await api('PUT', `/api/documents/${doc.id}`, ALICE, {
      title: 'Updated',
      content: '{"type":"doc","content":[]}',
    });
    expect(status).toBe(200);
    const updated = data as { title: string };
    expect(updated.title).toBe('Updated');
  });

  it('returns 403 when non-owner tries to update a document they cannot access', async () => {
    const { data: created } = await api('POST', '/api/documents', ALICE, {
      title: 'Alice Only',
    });
    const doc = created as { id: string };
    const { status } = await api('PUT', `/api/documents/${doc.id}`, BOB, {
      title: 'Hijacked',
    });
    expect(status).toBe(403);
  });
});

describe('DELETE /api/documents/:id', () => {
  it('deletes document (owner only)', async () => {
    const { data: created } = await api('POST', '/api/documents', ALICE, {
      title: 'To Delete',
    });
    const doc = created as { id: string };
    const { status } = await api('DELETE', `/api/documents/${doc.id}`, ALICE);
    expect(status).toBe(204);
    // Verify it's gone
    const { status: fetchStatus } = await api('GET', `/api/documents/${doc.id}`, ALICE);
    expect(fetchStatus).toBe(404);
  });

  it('returns 403 when non-owner tries to delete', async () => {
    const { data: created } = await api('POST', '/api/documents', ALICE, {
      title: 'Keep Me',
    });
    const doc = created as { id: string };
    const { status } = await api('DELETE', `/api/documents/${doc.id}`, BOB);
    expect(status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// Sharing
// ---------------------------------------------------------------------------
describe('POST /api/documents/:id/share', () => {
  it('shares a document with another user', async () => {
    const { data: created } = await api('POST', '/api/documents', ALICE, {
      title: 'Shared Doc',
    });
    const doc = created as { id: string };
    const { status } = await api('POST', `/api/documents/${doc.id}/share`, ALICE, {
      userId: BOB,
    });
    expect(status).toBe(200);
    // Bob can now access the document
    const { status: bobStatus } = await api('GET', `/api/documents/${doc.id}`, BOB);
    expect(bobStatus).toBe(200);
  });

  it('returns 400 when trying to share with yourself', async () => {
    const { data: created } = await api('POST', '/api/documents', ALICE, {
      title: 'Self Share Test',
    });
    const doc = created as { id: string };
    const { status } = await api('POST', `/api/documents/${doc.id}/share`, ALICE, {
      userId: ALICE,
    });
    expect(status).toBe(400);
  });

  it('returns 403 when non-owner tries to share', async () => {
    const { data: created } = await api('POST', '/api/documents', ALICE, {
      title: 'Not Bobs to Share',
    });
    const doc = created as { id: string };
    const { status } = await api('POST', `/api/documents/${doc.id}/share`, BOB, {
      userId: ALICE,
    });
    expect(status).toBe(403);
  });
});
