'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, useReducedMotion } from 'framer-motion';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface HomeHeroProps {
  eventsThisWeek: number;
}

export function HomeHero({ eventsThisWeek }: HomeHeroProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.2)] bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-light)_58%,#3b82f6_120%)] p-6 text-white shadow-[0_24px_45px_rgba(26,60,110,0.35)] sm:p-8 lg:p-10">
      <span className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full bg-[rgba(255,255,255,0.13)] blur-2xl" />
      <span className="pointer-events-none absolute -bottom-16 right-0 h-52 w-52 rounded-full bg-[rgba(45,125,79,0.28)] blur-3xl" />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
        viewBox="0 0 1100 440"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M-120 90C90 10 220 150 420 110C630 70 760 20 920 110C1010 160 1080 155 1220 120"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
        />
        <path
          d="M-70 260C70 210 200 320 390 285C580 250 760 185 900 260C990 306 1090 295 1190 252"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2"
        />
      </svg>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
      >
        <div>
          <p className="inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.08em]">
            Prefeitura Municipal de Bandeirantes - MS
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1]">
            Bandeirantes Conectada. Engaje com sua cidade.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-blue-50 sm:text-base">
            Descubra eventos, programas e iniciativas oficiais com uma experiencia clara, acessivel
            e viva para toda a populacao.
          </p>

          <form
            action="/public/eventos"
            method="GET"
            className="mt-6 rounded-3xl bg-white/95 p-4 text-black"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <Input
                  name="search"
                  label="Buscar evento, programa ou iniciativa..."
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="primary" className="md:px-7">
                Buscar agora
              </Button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/public/eventos">Ver eventos</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="border-white/35 text-white hover:bg-white/20"
            >
              <Link href="/public/programas">Saiba mais</Link>
            </Button>
          </div>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="justify-self-end rounded-3xl border border-white/25 bg-white/10 px-5 py-4 backdrop-blur"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-50">
            Em destaque
          </p>
          <p className="mt-2 text-lg font-semibold">{eventsThisWeek} eventos esta semana</p>
          <p className="mt-1 text-sm text-blue-50">
            Acompanhe inscricoes abertas e garanta sua vaga com poucos cliques.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
