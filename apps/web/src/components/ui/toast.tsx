'use client';

import { cn } from '@/lib/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastTone = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

const toneStyle: Record<ToastTone, string> = {
  success: 'border-[rgba(22,163,74,0.4)] bg-[rgba(22,163,74,0.12)] text-[var(--color-success)]',
  error: 'border-[rgba(220,38,38,0.35)] bg-[rgba(220,38,38,0.12)] text-[var(--color-error)]',
  warning: 'border-[rgba(217,119,6,0.36)] bg-[rgba(217,119,6,0.15)] text-[var(--color-warning)]',
  info: 'border-[rgba(2,132,199,0.35)] bg-[rgba(2,132,199,0.12)] text-[var(--color-info)]',
};

const toneIcon: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5" aria-hidden="true" />,
  error: <AlertCircle className="h-5 w-5" aria-hidden="true" />,
  warning: <TriangleAlert className="h-5 w-5" aria-hidden="true" />,
  info: <Info className="h-5 w-5" aria-hidden="true" />,
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toast: ToastInput) => {
    const nextToast: ToastItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: toast.title,
      description: toast.description,
      tone: toast.tone ?? 'info',
    };

    setToasts((current) => [...current, nextToast]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== nextToast.id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[90] flex w-[min(90vw,360px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.article
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.25 }}
              className={cn(
                'pointer-events-auto overflow-hidden rounded-2xl border p-3 shadow-[0_14px_32px_rgba(15,23,42,0.18)] backdrop-blur',
                toneStyle[toast.tone],
              )}
              aria-live="polite"
            >
              <div className="flex items-start gap-2">
                {toneIcon[toast.tone]}
                <div>
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {toast.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="toast-progress mt-3 h-1 w-full rounded-full bg-[rgba(255,255,255,0.45)]" />
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }

  return context;
}
