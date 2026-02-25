'use client';

import { Modal } from '@/components/ui/modal';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code2,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
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

  return 'border-slate-200 bg-white text-slate-600';
}

function resolveIconButtonClass(isActive: boolean): string {
  return `inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition ${resolveToolbarButtonClass(
    isActive,
  )}`;
}

function resolveDropdownTriggerClass(isActive: boolean): string {
  return `inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-semibold transition ${resolveToolbarButtonClass(
    isActive,
  )}`;
}

function parseImageDimension(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => parseImageDimension(element.getAttribute('width')),
        renderHTML: (attributes) => (attributes.width ? { width: String(attributes.width) } : {}),
      },
      height: {
        default: null,
        parseHTML: (element) => parseImageDimension(element.getAttribute('height')),
        renderHTML: (attributes) =>
          attributes.height ? { height: String(attributes.height) } : {},
      },
    };
  },
});

export function RichTextEditor({ value, onChange, onUploadImage }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageUrlInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [openMenu, setOpenMenu] = useState<'heading' | 'list' | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('https://');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlValue, setImageUrlValue] = useState('https://');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Highlight,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      ResizableImage,
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-44 rounded-b-xl border border-t-0 border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 focus:outline-none [&_p]:my-2 [&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:my-2 [&_h4]:font-semibold [&_ul]:my-2 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:ml-5 [&_ol]:list-decimal [&_li]:my-1 [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:text-slate-100 [&_a]:text-brand-700 [&_a]:underline [&_img]:max-w-full [&_img]:cursor-se-resize [&_.task-list]:ml-0 [&_.task-list]:list-none [&_.task-list-item]:flex [&_.task-list-item]:items-start [&_.task-list-item]:gap-2 [&_.task-list-item_input]:mt-1',
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

  useEffect(() => {
    if (!editor) return;

    const closeMenuOnClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('[data-editor-menu]')) return;
      setOpenMenu(null);
    };

    document.addEventListener('mousedown', closeMenuOnClickOutside);

    return () => {
      document.removeEventListener('mousedown', closeMenuOnClickOutside);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;

    const handleImageResizeStart = (event: MouseEvent) => {
      if (event.button !== 0) return;

      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (!editorElement.contains(target)) return;

      const position = editor.view.posAtDOM(target, 0);
      const imageNode = editor.state.doc.nodeAt(position);
      if (!imageNode || imageNode.type.name !== 'image') return;

      event.preventDefault();

      editor.chain().focus().setNodeSelection(position).run();

      const renderedWidth = Math.round(target.getBoundingClientRect().width);
      const renderedHeight = Math.round(target.getBoundingClientRect().height);
      const baseWidth =
        Number(imageNode.attrs.width) || renderedWidth || target.naturalWidth || 300;
      const baseHeight =
        Number(imageNode.attrs.height) || renderedHeight || target.naturalHeight || baseWidth;
      const ratio = baseHeight / baseWidth;
      const startX = event.clientX;
      const maxWidth = Math.max(120, editorElement.clientWidth - 24);

      let currentWidth = baseWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const nextWidth = Math.max(120, Math.min(maxWidth, Math.round(baseWidth + deltaX)));
        if (nextWidth === currentWidth) return;

        currentWidth = nextWidth;
        const nextHeight = Math.max(1, Math.round(nextWidth * ratio));
        const latestNode = editor.state.doc.nodeAt(position);
        if (!latestNode || latestNode.type.name !== 'image') return;

        editor.view.dispatch(
          editor.state.tr.setNodeMarkup(position, undefined, {
            ...latestNode.attrs,
            width: nextWidth,
            height: nextHeight,
          }),
        );
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    editorElement.addEventListener('mousedown', handleImageResizeStart);

    return () => {
      editorElement.removeEventListener('mousedown', handleImageResizeStart);
    };
  }, [editor]);

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
    setIsImageModalOpen(false);
  }

  function openLinkModal() {
    if (!editor) return;
    const previousUrl = (editor.getAttributes('link').href as string | undefined) ?? '';
    setLinkValue(previousUrl || 'https://');
    setIsLinkModalOpen(true);
    setTimeout(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    }, 50);
  }

  function applyLink() {
    if (!editor) return;

    const trimmed = linkValue.trim();
    if (!trimmed) {
      editor.chain().focus().unsetLink().run();
      setIsLinkModalOpen(false);
      return;
    }

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    editor
      .chain()
      .focus()
      .setLink({ href: hasProtocol ? trimmed : `https://${trimmed}` })
      .run();

    setIsLinkModalOpen(false);
  }

  function openImageModal() {
    setImageUrlValue('https://');
    setIsImageModalOpen(true);
    setTimeout(() => {
      imageUrlInputRef.current?.focus();
      imageUrlInputRef.current?.select();
    }, 50);
  }

  function applyImageUrl() {
    if (!editor) return;

    const trimmed = imageUrlValue.trim();
    if (!trimmed) return;

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    editor
      .chain()
      .focus()
      .setImage({ src: hasProtocol ? trimmed : `https://${trimmed}` })
      .run();
    setIsImageModalOpen(false);
  }

  const isDisabled = !editor || isUploadingImage;
  const headingActive =
    editor?.isActive('paragraph') ||
    editor?.isActive('heading', { level: 2 }) ||
    editor?.isActive('heading', { level: 3 }) ||
    editor?.isActive('heading', { level: 4 }) ||
    false;
  const listActive =
    editor?.isActive('bulletList') ||
    editor?.isActive('orderedList') ||
    editor?.isActive('taskList') ||
    false;

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={isDisabled || !(editor?.can().chain().focus().undo().run() ?? false)}
            aria-label="Desfazer"
            title="Desfazer"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={isDisabled || !(editor?.can().chain().focus().redo().run() ?? false)}
            aria-label="Refazer"
            title="Refazer"
          >
            <Redo2 size={14} />
          </button>
          <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
          <div className="relative" data-editor-menu>
            <button
              type="button"
              className={resolveDropdownTriggerClass(headingActive)}
              onClick={() => setOpenMenu((current) => (current === 'heading' ? null : 'heading'))}
              disabled={isDisabled}
              aria-label="Estilo de texto"
            >
              <span className="inline-flex items-center gap-1">
                <Pilcrow size={14} />
                <span>H</span>
              </span>
              <ChevronDown size={14} />
            </button>
            {openMenu === 'heading' ? (
              <div className="absolute left-0 top-10 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    editor?.chain().focus().setParagraph().run();
                    setOpenMenu(null);
                  }}
                >
                  <Pilcrow size={14} />
                  Texto
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    editor?.chain().focus().toggleHeading({ level: 2 }).run();
                    setOpenMenu(null);
                  }}
                >
                  <Heading2 size={14} />
                  H2
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    editor?.chain().focus().toggleHeading({ level: 3 }).run();
                    setOpenMenu(null);
                  }}
                >
                  <Heading3 size={14} />
                  H3
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    editor?.chain().focus().toggleHeading({ level: 4 }).run();
                    setOpenMenu(null);
                  }}
                >
                  <Heading4 size={14} />
                  H4
                </button>
              </div>
            ) : null}
          </div>
          <div className="relative" data-editor-menu>
            <button
              type="button"
              className={resolveDropdownTriggerClass(listActive)}
              onClick={() => setOpenMenu((current) => (current === 'list' ? null : 'list'))}
              disabled={isDisabled}
              aria-label="Tipo de lista"
            >
              <span className="inline-flex items-center gap-1">
                <List size={14} />
                <span>Lista</span>
              </span>
              <ChevronDown size={14} />
            </button>
            {openMenu === 'list' ? (
              <div className="absolute left-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    editor?.chain().focus().toggleBulletList().run();
                    setOpenMenu(null);
                  }}
                >
                  <List size={14} />
                  Bullet List
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    editor?.chain().focus().toggleOrderedList().run();
                    setOpenMenu(null);
                  }}
                >
                  <ListOrdered size={14} />
                  Ordered List
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    editor?.chain().focus().toggleTaskList().run();
                    setOpenMenu(null);
                  }}
                >
                  <ListTodo size={14} />
                  Task List
                </button>
              </div>
            ) : null}
          </div>
          <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('bold') ?? false)}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={isDisabled}
            aria-label="Negrito"
            title="Negrito"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('italic') ?? false)}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={isDisabled}
            aria-label="Itálico"
            title="Itálico"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('strike') ?? false)}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            disabled={isDisabled}
            aria-label="Tachado"
            title="Tachado"
          >
            <Strikethrough size={14} />
          </button>
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('code') ?? false)}
            onClick={() => editor?.chain().focus().toggleCode().run()}
            disabled={isDisabled}
            aria-label="Código"
            title="Código"
          >
            <Code2 size={14} />
          </button>
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('underline') ?? false)}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            disabled={isDisabled}
            aria-label="Sublinhado"
            title="Sublinhado"
          >
            <UnderlineIcon size={14} />
          </button>
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('highlight') ?? false)}
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            disabled={isDisabled}
            aria-label="Destaque"
            title="Destaque"
          >
            <Highlighter size={14} />
          </button>
          <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('subscript') ?? false)}
            onClick={() => editor?.chain().focus().toggleSubscript().run()}
            disabled={isDisabled}
            aria-label="Subscrito"
            title="Subscrito"
          >
            <SubscriptIcon size={14} />
          </button>
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('superscript') ?? false)}
            onClick={() => editor?.chain().focus().toggleSuperscript().run()}
            disabled={isDisabled}
            aria-label="Sobrescrito"
            title="Sobrescrito"
          >
            <SuperscriptIcon size={14} />
          </button>
          <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive({ textAlign: 'left' }) ?? false)}
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            disabled={isDisabled}
            aria-label="Alinhar à esquerda"
            title="Alinhar à esquerda"
          >
            <AlignLeft size={14} />
          </button>
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive({ textAlign: 'center' }) ?? false)}
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            disabled={isDisabled}
            aria-label="Centralizar"
            title="Centralizar"
          >
            <AlignCenter size={14} />
          </button>
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive({ textAlign: 'right' }) ?? false)}
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            disabled={isDisabled}
            aria-label="Alinhar à direita"
            title="Alinhar à direita"
          >
            <AlignRight size={14} />
          </button>
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive({ textAlign: 'justify' }) ?? false)}
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
            disabled={isDisabled}
            aria-label="Justificar"
            title="Justificar"
          >
            <AlignJustify size={14} />
          </button>
          <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('blockquote') ?? false)}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            disabled={isDisabled}
            aria-label="Citação"
            title="Citação"
          >
            <Quote size={14} />
          </button>
          <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
          <button
            type="button"
            className={resolveIconButtonClass(editor?.isActive('link') ?? false)}
            onClick={openLinkModal}
            disabled={isDisabled}
            aria-label="Link"
            title="Link"
          >
            <Link2 size={14} />
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            onClick={openImageModal}
            disabled={isDisabled}
            aria-label="Inserir imagem"
            title="Inserir imagem"
          >
            <ImagePlus size={14} />
            {isUploadingImage ? 'Enviando...' : 'Imagem'}
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

      <EditorContent editor={editor} aria-label="Simple Editor do Tiptap" />

      <Modal
        open={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Adicionar link"
      >
        <div className="space-y-3">
          <input
            ref={linkInputRef}
            type="url"
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            placeholder="https://exemplo.com"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                editor?.chain().focus().unsetLink().run();
                setIsLinkModalOpen(false);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Remover
            </button>
            <button
              type="button"
              onClick={applyLink}
              className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
            >
              Aplicar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Adicionar imagem"
      >
        <div className="space-y-3">
          <input
            ref={imageUrlInputRef}
            type="url"
            value={imageUrlValue}
            onChange={(event) => setImageUrlValue(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            placeholder="https://exemplo.com/imagem.png"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploadingImage}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
            >
              {isUploadingImage ? 'Enviando...' : 'Upload do arquivo'}
            </button>
            <button
              type="button"
              onClick={applyImageUrl}
              className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
            >
              Inserir URL
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
