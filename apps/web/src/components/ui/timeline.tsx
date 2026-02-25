'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useRef } from 'react';

export interface TimelineItem {
  id: string;
  dateLabel: string;
  title: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  });

  const lineScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.2,
  });

  return (
    <div ref={containerRef} className="relative pl-8">
      <span className="absolute left-3 top-0 h-full w-px bg-[var(--color-border)]" />
      <motion.span
        className="absolute left-3 top-0 w-px origin-top bg-[var(--color-accent)]"
        style={{ height: '100%', scaleY: reducedMotion ? 1 : lineScale }}
      />

      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.article
            key={item.id}
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.35, delay: index * 0.07 }}
            className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <span className="absolute -left-[1.56rem] top-6 h-3 w-3 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-accent)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              {item.dateLabel}
            </p>
            <h4 className="mt-1 text-base font-semibold text-[var(--color-text-primary)]">
              {item.title}
            </h4>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
