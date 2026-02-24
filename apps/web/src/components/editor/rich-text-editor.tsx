'use client';

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (nextHtml: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

function normalizeEditorHtml(rawHtml: string): string {
  const trimmed = rawHtml.trim();
  return trimmed === '<p></p>' ? '' : trimmed;
}

function resolveToolbarButtonClass(isActive: boolean): string {
  if (isActive) {
    return 'border-brand-300 bg-brand-50 text-brand-700';
  }

  return 'border-slate-200 bg-white text-slate-700';
}

export function RichTextEditor({ value, onChange, onUploadImage }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-44 rounded-b-xl border border-t-0 border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(normalizeEditorHtml(editor.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = normalizeEditorHtml(editor.getHTML());
    const nextHtml = normalizeEditorHtml(value);

    if (currentHtml === nextHtml) return;
    editor.commands.setContent(nextHtml || '<p></p>', { emitUpdate: false });
  }, [editor, value]);

  async function insertImage(file: File) {
    if (!editor) return;

    setIsUploadingImage(true);
    try {
      const imageUrl = await onUploadImage(file);
      editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleImageInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await insertImage(file);
  }

  function handleSetLink() {
    if (!editor) return;
    const previousUrl = (editor.getAttributes('link').href as string | undefined) ?? '';
    const nextUrl = window.prompt('Informe a URL do link', previousUrl || 'https://');
    if (nextUrl === null) return;

    const trimmed = nextUrl.trim();
    if (!trimmed) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    editor
      .chain()
      .focus()
      .setLink({ href: hasProtocol ? trimmed : `https://${trimmed}` })
      .run();
  }

  const isDisabled = !editor || isUploadingImage;

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${resolveToolbarButtonClass(editor?.isActive('paragraph') ?? false)}`}
            onClick={() => editor?.chain().focus().setParagraph().run()}
            disabled={isDisabled}
          >
            Texto
          </button>
          <button
            type="button"
            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${resolveToolbarButtonClass(editor?.isActive('heading', { level: 2 }) ?? false)}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={isDisabled}
          >
            Título
          </button>
          <button
            type="button"
            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${resolveToolbarButtonClass(editor?.isActive('heading', { level: 3 }) ?? false)}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            disabled={isDisabled}
          >
            Subtítulo
          </button>
          <button
            type="button"
            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${resolveToolbarButtonClass(editor?.isActive('bold') ?? false)}`}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={isDisabled}
          >
            Negrito
          </button>
          <button
            type="button"
            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${resolveToolbarButtonClass(editor?.isActive('italic') ?? false)}`}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={isDisabled}
          >
            Itálico
          </button>
          <button
            type="button"
            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${resolveToolbarButtonClass(editor?.isActive('bulletList') ?? false)}`}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={isDisabled}
          >
            Lista
          </button>
          <button
            type="button"
            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${resolveToolbarButtonClass(editor?.isActive('orderedList') ?? false)}`}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={isDisabled}
          >
            Lista numerada
          </button>
          <button
            type="button"
            className={`rounded-lg border px-2 py-1 text-xs font-semibold ${resolveToolbarButtonClass(editor?.isActive('link') ?? false)}`}
            onClick={handleSetLink}
            disabled={isDisabled}
          >
            Link
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
            onClick={() => imageInputRef.current?.click()}
            disabled={isDisabled}
          >
            {isUploadingImage ? 'Enviando imagem...' : 'Inserir imagem'}
          </button>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageInputChange}
          className="sr-only"
        />
      </div>

      <EditorContent editor={editor} aria-label="Editor Tiptap simples" />
    </div>
  );
}
