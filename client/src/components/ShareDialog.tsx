import { useState, useEffect } from 'react';
import { useUser } from '../lib/userContext';
import { getUsers, shareDocument, getShares } from '../lib/api';
import type { User, Share } from '../lib/api';

interface Props {
  documentId: string;
  ownerId: string;
  onClose: () => void;
}

export default function ShareDialog({ documentId, ownerId, onClose }: Props) {
  const { userId } = useUser();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = userId === ownerId;

  useEffect(() => {
    async function load() {
      try {
        const [users, currentShares] = await Promise.all([
          getUsers(userId),
          getShares(userId, documentId),
        ]);
        setAllUsers(users);
        setShares(currentShares);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, documentId]);

  const sharedUserIds = new Set(shares.map((s) => s.userId));
  const availableUsers = allUsers.filter(
    (u) => u.id !== userId && !sharedUserIds.has(u.id),
  );

  async function handleShare() {
    if (!selectedUserId) return;
    setSharing(true);
    setError(null);
    try {
      const newShare = await shareDocument(userId, documentId, selectedUserId);
      setShares((prev) => [...prev, newShare]);
      setSelectedUserId('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to share');
    } finally {
      setSharing(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Share Document</h2>
            <button
              id="share-dialog-close"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Current shares */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Shared with
                  </p>
                  {shares.length === 0 ? (
                    <p className="text-sm text-gray-400">Not shared with anyone yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {shares.map((share) => (
                        <li key={share.id} className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {share.user.name[0]}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{share.user.name}</p>
                            <p className="text-xs text-gray-400">{share.user.email}</p>
                          </div>
                          <span className="ml-auto text-xs text-gray-400">Can edit</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Add share */}
                {isOwner && availableUsers.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Add people
                    </p>
                    <div className="flex gap-2">
                      <select
                        id="share-user-select"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a person...</option>
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      <button
                        id="share-confirm-btn"
                        onClick={handleShare}
                        disabled={!selectedUserId || sharing}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {sharing ? 'Sharing…' : 'Share'}
                      </button>
                    </div>
                  </div>
                )}

                {isOwner && availableUsers.length === 0 && shares.length > 0 && (
                  <p className="text-sm text-gray-400 border-t border-gray-100 pt-4">
                    Shared with all available users.
                  </p>
                )}

                {!isOwner && (
                  <p className="text-sm text-gray-400 border-t border-gray-100 pt-4">
                    Only the document owner can manage sharing.
                  </p>
                )}

                {error && (
                  <p className="mt-3 text-sm text-red-600">{error}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
