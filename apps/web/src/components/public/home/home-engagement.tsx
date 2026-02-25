'use client';

import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Timeline } from '@/components/ui/timeline';
import { useToast } from '@/components/ui/toast';
import { HOME_FAQ, HOME_TIMELINE } from './home-data';
import { Reveal } from './reveal';

interface HomeEngagementProps {
  modalOpen: boolean;
  onCloseModal: () => void;
}

export function HomeEngagement({ modalOpen, onCloseModal }: HomeEngagementProps) {
  const { showToast } = useToast();

  const handleDemoSubmit = () => {
    showToast({
      tone: 'success',
      title: 'Pre-inscricao simulada com sucesso',
      description: 'Protocolo ENG-2026-00987 gerado para validacao.',
    });
    onCloseModal();
  };

  return (
    <section className="space-y-6">
      <div className="space-y-6">
        <Reveal>
          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_12px_25px_rgba(15,23,42,0.08)] sm:p-6">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              FAQ dos programas
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Duvidas frequentes para facilitar o acesso da populacao.
            </p>
            <div className="mt-4">
              <Accordion items={HOME_FAQ} />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_12px_25px_rgba(15,23,42,0.08)] sm:p-6">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Linha do tempo de acoes
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Planejamento publico com acompanhamento transparente.
            </p>
            <div className="mt-4">
              <Timeline items={HOME_TIMELINE} />
            </div>
          </div>
        </Reveal>
      </div>

      <Modal open={modalOpen} onClose={onCloseModal} title="Inscricao rapida na Caravana da Saude">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Este modal simula o fluxo de inscricao com feedback imediato e protocolo digital.
        </p>
        <div className="mt-4 grid gap-3">
          <Input label="Nome" defaultValue="Joao Pereira" />
          <Input label="CPF" defaultValue="98765432100" />
          <Button variant="primary" onClick={handleDemoSubmit}>
            Finalizar simulacao
          </Button>
        </div>
      </Modal>
    </section>
  );
}
