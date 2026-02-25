'use client';

import { buildFacebookShareUrl, buildWhatsappShareUrl } from '@/lib/public-share';
import { Facebook, Instagram, Link2, MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PublicShareActionsProps {
  title: string;
  shareUrl: string;
  ctaText?: string;
}

const INSTAGRAM_URL = 'https://www.instagram.com/';
const FEEDBACK_TIMEOUT_MS = 2200;
const SHARE_ICON_BUTTON_CLASSNAME =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-slate-900 shadow-[0_1px_2px_rgba(2,6,23,0.16)] transition hover:bg-slate-300 hover:text-slate-900 dark:border-slate-200 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white dark:hover:text-slate-950';

async function copyToClipboard(value: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function PublicShareActions({
  title,
  shareUrl,
  ctaText = 'Convide alguém para participar',
}: PublicShareActionsProps) {
  const [feedback, setFeedback] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setFeedback('');
    }, FEEDBACK_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopyLink = useCallback(async () => {
    const copied = await copyToClipboard(shareUrl);
    showFeedback(copied ? 'Link copiado.' : 'Não foi possível copiar o link.');
  }, [shareUrl, showFeedback]);

  const handleInstagramShare = useCallback(async () => {
    const copied = await copyToClipboard(shareUrl);
    window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
    showFeedback(
      copied ? 'Link copiado. Cole no Instagram.' : 'Instagram aberto. Copie o link manualmente.',
    );
  }, [shareUrl, showFeedback]);

  return (
    <div className="mt-5 border-t border-slate-200 pt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        Compartilhar
      </p>
      <p className="mt-1 text-sm text-slate-600">{ctaText}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={buildWhatsappShareUrl({ title, url: shareUrl })}
          target="_blank"
          rel="noreferrer"
          className={SHARE_ICON_BUTTON_CLASSNAME}
          aria-label={`Compartilhar ${title} no WhatsApp`}
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={handleInstagramShare}
          className={SHARE_ICON_BUTTON_CLASSNAME}
          aria-label={`Compartilhar ${title} no Instagram`}
          title="Compartilhar no Instagram"
        >
          <Instagram className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Instagram</span>
        </button>

        <a
          href={buildFacebookShareUrl(shareUrl)}
          target="_blank"
          rel="noreferrer"
          className={SHARE_ICON_BUTTON_CLASSNAME}
          aria-label={`Compartilhar ${title} no Facebook`}
          title="Compartilhar no Facebook"
        >
          <Facebook className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Facebook</span>
        </a>

        <button
          type="button"
          onClick={handleCopyLink}
          className={SHARE_ICON_BUTTON_CLASSNAME}
          aria-label={`Copiar link de ${title}`}
          title="Copiar link"
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Copiar link</span>
        </button>
      </div>

      <p className="mt-3 min-h-5 text-xs font-medium text-slate-500" aria-live="polite">
        {feedback}
      </p>
    </div>
  );
}
