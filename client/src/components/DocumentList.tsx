import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../lib/userContext';
import { getDocuments, createDocument, deleteDocument } from '../lib/api';
import type { Document } from '../lib/api';
import FileUpload from './FileUpload';

interface Props {
  view: 'mine' | 'shared';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DocumentList({ view }: Props) {
  const { userId, user } = useUser();
  const navigate = useNavigate();

  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getDocuments(userId);
      setDocs(
        view === 'mine'
          ? all.filter((d) => d.ownerId === userId)
          : all.filter((d) => d.ownerId !== userId),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [userId, view]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    setCreating(true);
    try {
      const doc = await createDocument(userId, { title: 'Untitled Document' });
      navigate(`/doc/${doc.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create document');
      setCreating(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, docId: string) {
    e.stopPropagation();
    if (!confirm('Delete this document? This cannot be undone.')) return;
    setDeletingId(docId);
    try {
      await deleteDocument(userId, docId);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  }

  const title = view === 'mine' ? 'My Documents' : 'Shared With Me';

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">Signed in as {user.name}</p>
        </div>
        {view === 'mine' && (
          <div className="flex items-center gap-2">
            <FileUpload onUploaded={(id) => navigate(`/doc/${id}`)} />
            <button
              id="create-document-btn"
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {creating ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              New Document
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && docs.length === 0 && (
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No documents yet</p>
          {view === 'mine' && (
            <p className="text-gray-400 text-sm mt-1">Create your first document above</p>
          )}
          {view === 'shared' && (
            <p className="text-gray-400 text-sm mt-1">Documents shared with you will appear here</p>
          )}
        </div>
      )}

      {/* Document list */}
      {!loading && docs.length > 0 && (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/doc/${doc.id}`)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {view === 'shared' && <span className="mr-1">by {doc.owner.name} ·</span>}
                    Updated {formatDate(doc.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {doc.ownerId === userId && doc.shares.length > 0 && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    Shared
                  </span>
                )}
                {view === 'mine' && (
                  <button
                    id={`delete-doc-${doc.id}`}
                    onClick={(e) => handleDelete(e, doc.id)}
                    disabled={deletingId === doc.id}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all rounded"
                    title="Delete document"
                  >
                    {deletingId === doc.id ? (
                      <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
