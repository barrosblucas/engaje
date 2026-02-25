'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const open = openId === item.id;

        return (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {item.title}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[var(--color-text-muted)] transition ${open ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <p className="border-t border-[var(--color-border)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {item.content}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
