import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useUser } from '../lib/userContext';
import { getDocument, updateDocument } from '../lib/api';
import type { Document } from '../lib/api';
import EditorToolbar from './EditorToolbar';
import ShareDialog from './ShareDialog';

// Parse content stored in the database
function getEditorContent(raw: string): string | object {
  if (!raw || raw === '{}') return { type: 'doc', content: [{ type: 'paragraph' }] };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if ('__html' in parsed) return parsed.__html as string;
    return parsed;
  } catch {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }
}

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useUser();

  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Title state
  const [title, setTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const pendingContentRef = useRef<string | null>(null);

  // Share dialog
  const [showShare, setShowShare] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none min-h-[500px] px-1',
      },
    },
    onUpdate({ editor }) {
      pendingContentRef.current = JSON.stringify(editor.getJSON());
      setSaveStatus('idle');
    },
  });

  // Load document
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getDocument(userId, id)
      .then((data) => {
        setDoc(data);
        setTitle(data.title);
        const content = getEditorContent(data.content);
        if (editor) {
          editor.commands.setContent(content as string | object);
        }
        pendingContentRef.current = data.content;
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Failed to load document';
        if (msg.includes('Access denied') || msg.includes('not found')) {
          navigate('/');
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [id, userId, editor, navigate]);

  // Save document content + title
  async function handleSave() {
    if (!id || !doc) return;
    setSaving(true);
    try {
      const updated = await updateDocument(userId, id, {
        title,
        content: pendingContentRef.current ?? doc.content,
      });
      setDoc(updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  // Save title on blur
  async function handleTitleBlur() {
    setEditingTitle(false);
    const trimmed = title.trim() || 'Untitled Document';
    setTitle(trimmed);
    if (!id || !doc || trimmed === doc.title) return;
    try {
      const updated = await updateDocument(userId, id, { title: trimmed });
      setDoc(updated);
    } catch {
      setTitle(doc.title); // revert on error
    }
  }

  // Keyboard: save on Ctrl+S — registered once on mount
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to documents
        </button>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        {/* Back + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors"
            title="Back to documents"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {editingTitle ? (
            <input
              ref={titleInputRef}
              id="document-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') titleInputRef.current?.blur();
                if (e.key === 'Escape') {
                  setTitle(doc.title);
                  setEditingTitle(false);
                }
              }}
              className="text-lg font-semibold text-gray-900 border-b-2 border-blue-500 bg-transparent outline-none px-1 min-w-0 flex-1"
              autoFocus
            />
          ) : (
            <h1
              id="document-title"
              onClick={() => setEditingTitle(true)}
              className="text-lg font-semibold text-gray-900 cursor-text hover:bg-gray-100 px-1 rounded truncate"
              title="Click to rename"
            >
              {title}
            </h1>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4 shrink-0">
          {/* Save status */}
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-600 font-medium">✓ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-600 font-medium">Save failed</span>
          )}

          {/* Share button */}
          <button
            id="share-btn"
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          {/* Save button */}
          <button
            id="save-btn"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            Save
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor area */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Share dialog */}
      {showShare && (
        <ShareDialog
          documentId={doc.id}
          ownerId={doc.ownerId}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
