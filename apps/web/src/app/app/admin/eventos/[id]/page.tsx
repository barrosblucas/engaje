'use client';

import {
  useAdminEvent,
  useCreateEvent,
  useUpdateEvent,
  useUpdateEventStatus,
} from '@/shared/hooks/use-admin';
import type { CreateEventInput } from '@engaje/contracts';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const CATEGORIES = [
  { value: 'cultura', label: 'Cultura' },
  { value: 'esporte', label: 'Esporte' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'civico', label: 'Cívico' },
  { value: 'festa', label: 'Festa' },
] as const;

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['published', 'cancelled'],
  published: ['closed', 'cancelled'],
  closed: [],
  cancelled: [],
};

type EventFormData = {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  locationName: string;
  locationAddress: string;
  totalSlots: string;
};

const EMPTY_FORM: EventFormData = {
  title: '',
  description: '',
  category: 'cultura',
  startDate: '',
  endDate: '',
  locationName: '',
  locationAddress: '',
  totalSlots: '',
};

export default function AdminEventoFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === 'novo';
  const router = useRouter();

  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('draft');

  const { data: existing, isLoading } = useAdminEvent(isNew ? '' : id);
  const { mutate: createEvent, isPending: creating } = useCreateEvent();
  const { mutate: updateEvent, isPending: updating } = useUpdateEvent(id);
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateEventStatus(id);

  useEffect(() => {
    if (existing && !isNew) {
      const ev = existing as Record<string, unknown>;
      setForm({
        title: String(ev.title ?? ''),
        description: String(ev.description ?? ''),
        category: String(ev.category ?? 'cultura'),
        startDate: ev.startDate ? String(ev.startDate).slice(0, 16) : '',
        endDate: ev.endDate ? String(ev.endDate).slice(0, 16) : '',
        locationName: String(ev.locationName ?? ''),
        locationAddress: String(ev.locationAddress ?? ''),
        totalSlots: String(ev.totalSlots ?? ''),
      });
      setCurrentStatus(String(ev.status ?? 'draft'));
    }
  }, [existing, isNew]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function buildPayload(): CreateEventInput {
    return {
      title: form.title,
      description: form.description,
      category: form.category as CreateEventInput['category'],
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      locationName: form.locationName,
      locationAddress: form.locationAddress,
      totalSlots: form.totalSlots ? Number(form.totalSlots) : undefined,
      status: currentStatus as CreateEventInput['status'],
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.description.trim()) {
      setError('Descrição é obrigatória.');
      return;
    }

    if (!form.endDate) {
      setError('Data de término é obrigatória.');
      return;
    }

    if (Number(form.totalSlots) < 1 && form.totalSlots !== '') {
      setError('Total de vagas deve ser maior que zero.');
      return;
    }

    const payload = buildPayload();

    if (isNew) {
      createEvent(payload, {
        onSuccess: () => router.push('/app/admin/eventos'),
        onError: () => setError('Erro ao criar evento.'),
      });
    } else {
      updateEvent(payload, {
        onSuccess: () => router.push('/app/admin/eventos'),
        onError: () => setError('Erro ao atualizar evento.'),
      });
    }
  }

  function handleStatusChange(newStatus: string) {
    if (!confirm(`Alterar status para "${newStatus}"?`)) return;
    updateStatus(
      { status: newStatus as 'published' | 'closed' | 'cancelled' },
      {
        onSuccess: () => setCurrentStatus(newStatus),
        onError: () => setError('Erro ao alterar status.'),
      },
    );
  }

  if (!isNew && isLoading) return <p>Carregando...</p>;

  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];

  return (
    <div className="app-page">
      <div className="container">
        <div className="page-header">
          <h1>{isNew ? 'Novo Evento' : 'Editar Evento'}</h1>
          <a href="/app/admin/eventos" className="btn-ghost">
            ← Voltar
          </a>
        </div>

        {/* Status transitions (edit only) */}
        {!isNew && transitions.length > 0 && (
          <div className="status-actions">
            <strong>Status atual: {currentStatus}</strong>
            {transitions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusChange(s)}
                disabled={updatingStatus}
                className="btn-secondary"
              >
                → {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="field">
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className="field">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="category">Categoria *</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="totalSlots">Total de vagas *</label>
              <input
                id="totalSlots"
                name="totalSlots"
                type="number"
                min="1"
                value={form.totalSlots}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="startDate">Data de início *</label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="endDate">Data de término</label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="locationName">Local *</label>
            <input
              id="locationName"
              name="locationName"
              type="text"
              value={form.locationName}
              onChange={handleChange}
              required
              minLength={2}
            />
          </div>

          <div className="field">
            <label htmlFor="locationAddress">Endereço completo *</label>
            <input
              id="locationAddress"
              name="locationAddress"
              type="text"
              value={form.locationAddress}
              onChange={handleChange}
              required
              minLength={5}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={creating || updating}>
              {creating || updating ? 'Salvando...' : isNew ? 'Criar evento' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
