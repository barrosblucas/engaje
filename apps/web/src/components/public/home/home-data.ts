import { Activity, BriefcaseBusiness, HeartPulse, Leaf, PartyPopper, Trophy } from 'lucide-react';
import type { ComponentType } from 'react';

interface HomeCategory {
  id: string;
  label: string;
  description: string;
  colorToken: string;
  icon: ComponentType<{ className?: string }>;
}

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    id: 'saude',
    label: 'Saude',
    description: 'Caravanas, exames e cuidado preventivo para todas as idades.',
    colorToken: 'var(--color-secondary)',
    icon: HeartPulse,
  },
  {
    id: 'esporte',
    label: 'Esporte',
    description: 'Corridas, campeonatos e aulas abertas nos bairros.',
    colorToken: 'var(--color-accent)',
    icon: Trophy,
  },
  {
    id: 'cultura',
    label: 'Cultura & Lazer',
    description: 'Feiras, festas tradicionais e programação cultural.',
    colorToken: '#7c3aed',
    icon: PartyPopper,
  },
  {
    id: 'empreendedorismo',
    label: 'Empreendedorismo',
    description: 'Capacitação e redes para fortalecer negócios locais.',
    colorToken: 'var(--color-primary)',
    icon: BriefcaseBusiness,
  },
  {
    id: 'vacinacao',
    label: 'Vacinação',
    description: 'Campanhas com cronograma atualizado por unidade.',
    colorToken: '#1f9d62',
    icon: Activity,
  },
  {
    id: 'meio-ambiente',
    label: 'Meio Ambiente',
    description: 'Mutirões e projetos de preservação urbana e rural.',
    colorToken: '#166534',
    icon: Leaf,
  },
];

export const HOME_FAQ = [
  {
    id: 'faq-1',
    title: 'Como faco minha inscricao no evento?',
    content:
      'Informe nome, CPF, telefone e e-mail. O sistema confirma na hora e gera protocolo digital.',
  },
  {
    id: 'faq-2',
    title: 'Preciso pagar para participar?',
    content:
      'A maioria dos eventos municipais é gratuita. Quando houver regras específicas, elas ficam visíveis na página do evento.',
  },
  {
    id: 'faq-3',
    title: 'Posso acompanhar minhas inscricoes?',
    content: 'Sim. Em Minhas Inscrições voce consulta status, historico e QR Code para check-in.',
  },
];

export const HOME_TIMELINE = [
  {
    id: 'tl-1',
    dateLabel: 'Marco 2026',
    title: 'Mutirao Cidadao Integrado',
    description: 'Atendimento social, orientação jurídica e serviços da prefeitura no mesmo local.',
  },
  {
    id: 'tl-2',
    dateLabel: 'Abril 2026',
    title: 'Circuito Esportivo da Cidade',
    description:
      'Calendário de corridas e atividades físicas com apoio das secretarias municipais.',
  },
  {
    id: 'tl-3',
    dateLabel: 'Maio 2026',
    title: 'Semana do Empreendedor Local',
    description: 'Oficinas, mentorias e rodadas de conexões para o comércio de Bandeirantes.',
  },
];
