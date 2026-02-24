import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { HOME_NEWS } from './home-data';
import { Reveal } from './reveal';

export function HomeNews() {
  return (
    <section id="noticias">
      <Reveal>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Ultimas noticias
            </p>
            <h2 className="mt-1 text-[clamp(1.35rem,3vw,2rem)] font-semibold text-[var(--color-text-primary)]">
              Iniciativas e comunicados oficiais
            </h2>
          </div>
          <Button variant="ghost">Todas as noticias</Button>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {HOME_NEWS.map((news, index) => (
          <Reveal key={news.id} delay={Math.min(index * 0.08, 0.4)}>
            <Card variant="news" className="h-full">
              <Badge tone="primary">{news.category}</Badge>
              <h3 className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
                {news.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{news.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                <span>{news.dateLabel}</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold text-[var(--color-primary)]"
                >
                  Ler mais <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
