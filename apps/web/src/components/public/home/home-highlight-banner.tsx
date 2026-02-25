import { Button } from '@/components/ui/button';
import type { ProgramDetail } from '@engaje/contracts';
import Link from 'next/link';
import { Reveal } from './reveal';

interface HomeHighlightBannerProps {
  activeProgram: ProgramDetail | null;
  onOpenModal: () => void;
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function HomeHighlightBanner({ activeProgram, onOpenModal }: HomeHighlightBannerProps) {
  const title = activeProgram?.title ?? 'Nenhum programa ativo no momento';
  const description = activeProgram
    ? stripHtml(activeProgram.description).slice(0, 180)
    : 'Novos programas publicados aparecem aqui para destacar as ações prioritárias da prefeitura.';
  const detailsHref = activeProgram
    ? `/public/programas/${activeProgram.slug}`
    : '/public/programas';
  const bannerBackground = activeProgram?.bannerUrl
    ? `linear-gradient(120deg,rgba(26,60,110,0.88),rgba(45,125,79,0.88)),url('${activeProgram.bannerUrl}')`
    : "linear-gradient(120deg,rgba(26,60,110,0.94),rgba(45,125,79,0.92)),url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80')";

  return (
    <Reveal>
      <section
        className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.2)] bg-cover bg-center p-7 text-white shadow-[0_18px_36px_rgba(15,23,42,0.28)] sm:p-9"
        style={{ backgroundImage: bannerBackground }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(13,27,42,0.45),transparent)]" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-100">
            Programa ativo
          </p>
          <h2 className="mt-2 text-[clamp(1.4rem,3vw,2rem)] font-semibold">{title}</h2>
          <p className="mt-3 text-sm text-blue-50 sm:text-base">{description}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {activeProgram?.registrationMode === 'informative' &&
            activeProgram.externalCtaLabel &&
            activeProgram.externalCtaUrl ? (
              <Button variant="primary" asChild>
                <a href={activeProgram.externalCtaUrl} target="_blank" rel="noreferrer">
                  {activeProgram.externalCtaLabel}
                </a>
              </Button>
            ) : activeProgram ? (
              <Button variant="primary" onClick={onOpenModal}>
                Quero participar
              </Button>
            ) : (
              <Button variant="primary" asChild>
                <Link href="/public/programas">Ver programas</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              className="border-white/35 text-white hover:bg-white/20"
              asChild
            >
              <Link href={detailsHref}>
                {activeProgram ? 'Ver detalhes do programa' : 'Explorar programas publicados'}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
