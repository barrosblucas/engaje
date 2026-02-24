import { Button } from '@/components/ui/button';
import { Reveal } from './reveal';

interface HomeHighlightBannerProps {
  onOpenModal: () => void;
}

export function HomeHighlightBanner({ onOpenModal }: HomeHighlightBannerProps) {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.2)] bg-[linear-gradient(120deg,rgba(26,60,110,0.94),rgba(45,125,79,0.92)),url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center p-7 text-white shadow-[0_18px_36px_rgba(15,23,42,0.28)] sm:p-9">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(13,27,42,0.45),transparent)]" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-100">
            Programa ativo
          </p>
          <h2 className="mt-2 text-[clamp(1.4rem,3vw,2rem)] font-semibold">
            Caravana da Saude 2026
          </h2>
          <p className="mt-3 text-sm text-blue-50 sm:text-base">
            Acoes integradas de prevencao, orientacao e atendimento nos bairros urbanos e zona
            rural.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="primary" onClick={onOpenModal}>
              Quero participar
            </Button>
            <Button variant="ghost" className="border-white/35 text-white hover:bg-white/20">
              Ver detalhes do programa
            </Button>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
