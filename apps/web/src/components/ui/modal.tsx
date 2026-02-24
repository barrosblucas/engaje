'use client';

import { cn } from '@/lib/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80]" role="presentation">
          <motion.button
            aria-label="Fechar modal"
            className="absolute inset-0 bg-[rgba(9,17,28,0.55)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.dialog
              open
              aria-label={title}
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'relative w-full max-w-xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_30px_60px_rgba(15,23,42,0.3)]',
              )}
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <h3 className="pr-10 text-xl font-semibold text-[var(--color-text-primary)]">
                {title}
              </h3>
              <div className="mt-4">{children}</div>
            </motion.dialog>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
