'use client';

import { Accordion } from '@/components/ui/accordion';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Timeline } from '@/components/ui/timeline';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';
import { HOME_FAQ, HOME_TIMELINE } from './home-data';
import { Reveal } from './reveal';

interface HomeEngagementProps {
  modalOpen: boolean;
  onCloseModal: () => void;
}

const FILTER_TAGS = ['Familia', 'Juventude', 'Saude', 'Empreender', 'Cultura'];

export function HomeEngagement({ modalOpen, onCloseModal }: HomeEngagementProps) {
  const { showToast } = useToast();
  const [selectedTag, setSelectedTag] = useState(FILTER_TAGS[0]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const simulateFilter = () => {
    setLoadingPreview(true);

    window.setTimeout(() => {
      setLoadingPreview(false);
      showToast({
        tone: 'info',
        title: 'Filtro aplicado',
        description: `Exibindo prioridade para ${selectedTag}.`,
      });
    }, 900);
  };

  const handleDemoSubmit = () => {
    showToast({
      tone: 'success',
      title: 'Pre-inscricao simulada com sucesso',
      description: 'Protocolo ENG-2026-00987 gerado para validacao.',
    });
    onCloseModal();
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Reveal>
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_12px_25px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Experiencia de inscricao
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">
                Pre-inscricao online sem friccao
              </h3>
            </div>
            <Badge tone="success">Acessivel para mobile</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTER_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={selectedTag === tag}
                onClick={() => setSelectedTag(tag)}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input label="Nome completo" defaultValue="Maria de Souza" />
            <Input label="CPF" defaultValue="12345678901" />
            <Input label="Telefone" defaultValue="(67) 99999-0000" />
            <Input label="E-mail" defaultValue="maria@exemplo.com" type="email" />
            <Select
              label="Tipo de evento"
              defaultValue="presencial"
              options={[
                { value: 'presencial', label: 'Presencial' },
                { value: 'online', label: 'Online' },
              ]}
            />
            <DatePicker label="Data preferencial" defaultValue="2026-03-06" />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={simulateFilter}>
              Simular filtros
            </Button>
            <Button variant="primary" onClick={handleDemoSubmit}>
              Confirmar inscricao
            </Button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Avatar name="Secretaria de Saude" subtitle="Organizadora" />
            <Avatar name="Equipe Engaje" subtitle="Atendimento digital" />
          </div>

          {loadingPreview ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : null}
        </div>
      </Reveal>

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
