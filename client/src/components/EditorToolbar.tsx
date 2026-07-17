import React from 'react';
import { useEditor } from '@tiptap/react';

type Editor = ReturnType<typeof useEditor>;

interface Props {
  editor: Editor;
}

interface ToolbarButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isActive: () => boolean;
}

function Icon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export default function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  const buttons: ToolbarButton[] = [
    {
      id: 'toolbar-bold',
      label: 'Bold',
      icon: <span className="font-bold text-sm">B</span>,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      id: 'toolbar-italic',
      label: 'Italic',
      icon: <span className="italic text-sm">I</span>,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      id: 'toolbar-underline',
      label: 'Underline',
      icon: <span className="underline text-sm">U</span>,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
  ];

  const headingButtons = [1, 2, 3].map((level) => ({
    id: `toolbar-h${level}`,
    label: `Heading ${level}`,
    icon: <span className="text-sm font-semibold">H{level}</span>,
    action: () =>
      editor
        .chain()
        .focus()
        .toggleHeading({ level: level as 1 | 2 | 3 })
        .run(),
    isActive: () => editor.isActive('heading', { level }),
  }));

  const listButtons: ToolbarButton[] = [
    {
      id: 'toolbar-bullet-list',
      label: 'Bullet List',
      icon: <Icon d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      id: 'toolbar-ordered-list',
      label: 'Numbered List',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      ),
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
  ];

  const allGroups = [buttons, headingButtons, listButtons];

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50 flex-wrap">
      {allGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="flex items-center gap-1">
          {groupIdx > 0 && (
            <div className="w-px h-5 bg-gray-300 mx-1" />
          )}
          {group.map((btn) => (
            <button
              key={btn.id}
              id={btn.id}
              onClick={btn.action}
              title={btn.label}
              className={`px-2.5 py-1.5 rounded text-sm transition-colors ${
                btn.isActive()
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
