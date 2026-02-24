import { PublicBadge } from '@/components/public/public-badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contato e FAQ',
  description:
    'Canais oficiais de atendimento da Prefeitura, dúvidas frequentes e orientações para inscrições.',
};

const FAQ_ITEMS = [
  {
    question: 'Preciso ter conta para me inscrever em um evento?',
    answer:
      'Sim. O cadastro é rápido e permite acompanhar protocolos, status da inscrição e histórico.',
  },
  {
    question: 'Como sei se ainda há vagas?',
    answer:
      'Na página do evento você encontra a disponibilidade em tempo real e avisos de vagas esgotadas.',
  },
  {
    question: 'Posso cancelar minha inscrição?',
    answer:
      'Sim. Entre em “Minhas Inscrições” após login e selecione o evento que deseja cancelar.',
  },
  {
    question: 'Onde encontro horários e documentos necessários?',
    answer:
      'Na seção de detalhes de cada evento ou iniciativa, com datas, local e orientações públicas.',
  },
];

export default function ContatoPage() {
  return (
    <div className="page-transition mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <PublicBadge tone="community">Atendimento cidadão</PublicBadge>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
          Contato e informações úteis
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Acesse canais oficiais da Prefeitura para suporte sobre inscrições, eventos, programas e
          dúvidas gerais.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-2xl font-semibold text-slate-900">Canais oficiais</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Ouvidoria</p>
              <p>0800 000 000 • seg a sex (8h às 17h)</p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">WhatsApp cidadão</p>
              <p>(67) 99999-0000</p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">E-mail institucional</p>
              <p>atendimento@bandeirantes.ms.gov.br</p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Endereço</p>
              <p>Praça Central, 100 — Centro</p>
            </li>
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-2xl font-semibold text-slate-900">FAQ rápido</h2>
          <div className="mt-4 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-slate-900 group-open:text-brand-700">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
