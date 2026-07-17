import { useRef, useState } from 'react';
import { marked } from 'marked';
import { useUser } from '../lib/userContext';
import { createDocument } from '../lib/api';

interface Props {
  onUploaded: (docId: string) => void;
}

function mdToHtml(md: string): string {
  try {
    const result = marked(md);
    return typeof result === 'string' ? result : md;
  } catch {
    return md
      .split('\n')
      .filter(Boolean)
      .map((line) => `<p>${line}</p>`)
      .join('');
  }
}

export default function FileUpload({ onUploaded }: Props) {
  const { userId } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'txt' && ext !== 'md') {
      setError('Only .txt and .md files are supported');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const text = await file.text();
      const title = file.name.replace(/\.(txt|md)$/, '') || 'Uploaded Document';

      let content: string;

      if (ext === 'md') {
        // Store as HTML marker so the editor sets content via setContent(html)
        const html = mdToHtml(text);
        content = JSON.stringify({ __html: html });
      } else {
        // Plain text: build Tiptap doc JSON directly
        const paragraphs = text
          .split('\n')
          .map((line) => ({
            type: 'paragraph',
            content: line.trim() ? [{ type: 'text', text: line }] : [],
          }));
        content = JSON.stringify({ type: 'doc', content: paragraphs });
      }

      const doc = await createDocument(userId, { title, content });
      onUploaded(doc.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md"
        className="hidden"
        onChange={handleFile}
        id="file-upload-input"
      />
      <button
        id="upload-file-btn"
        onClick={handleClick}
        disabled={uploading}
        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        title="Upload .txt or .md file"
      >
        {uploading ? (
          <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
        Upload
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
