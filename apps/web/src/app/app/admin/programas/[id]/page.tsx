'use client';

import { DynamicFormBuilder } from '@/components/dynamic-form/dynamic-form-builder';
import { DynamicFormPreview } from '@/components/dynamic-form/dynamic-form-preview';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import {
  type BuilderFieldDraft,
  deserializeDynamicFormSchema,
  serializeBuilderFields,
  validateBuilderFieldsByMode,
} from '@/shared/dynamic-form/builder-utils';
import {
  useAdminImageUpload,
  useAdminProgram,
  useCreateProgram,
  useUpdateProgram,
} from '@/shared/hooks/use-admin';
import type { CreateProgramInput, RegistrationMode, UpdateProgramInput } from '@engaje/contracts';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

type StepId = 'base' | 'content' | 'mode' | 'builder';

const STEPS: Array<{ id: StepId; label: string }> = [
  { id: 'base', label: 'Dados base' },
  { id: 'content', label: 'Conteúdo público' },
  { id: 'mode', label: 'Inscrição / Informativo' },
  { id: 'builder', label: 'Builder de campos' },
];

const CATEGORIES = [
  { value: 'cultura', label: 'Cultura' },
  { value: 'esporte', label: 'Esporte' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'civico', label: 'Cívico' },
  { value: 'festa', label: 'Festa' },
] as const;

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'closed', label: 'Encerrado' },
  { value: 'cancelled', label: 'Cancelado' },
] as const;

type ProgramFormData = {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  totalSlots: string;
  bannerUrl: string;
  bannerAltText: string;
  registrationMode: RegistrationMode;
  externalCtaLabel: string;
  externalCtaUrl: string;
  status: 'draft' | 'published' | 'closed' | 'cancelled';
  isHighlightedOnHome: boolean;
};

const EMPTY_FORM: ProgramFormData = {
  title: '',
  description: '',
  category: 'cultura',
  startDate: '',
  endDate: '',
  totalSlots: '',
  bannerUrl: '',
  bannerAltText: '',
  registrationMode: 'registration',
  externalCtaLabel: '',
  externalCtaUrl: '',
  status: 'draft',
  isHighlightedOnHome: false,
};

function toDateTimeLocal(value?: string | null): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string {
  return new Date(value).toISOString();
}

function hasMeaningfulRichText(rawHtml: string): boolean {
  return (
    rawHtml
      .replace(/<[^>]*>/g, ' ')
      .replaceAll('&nbsp;', ' ')
      .replace(/\s+/g, ' ')
      .trim().length > 0
  );
}

export default function AdminProgramaFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === 'novo';
  const router = useRouter();

  const [form, setForm] = useState<ProgramFormData>(EMPTY_FORM);
  const [builderFields, setBuilderFields] = useState<BuilderFieldDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<StepId>('base');

  const { data: existing, isLoading } = useAdminProgram(isNew ? '' : id);
  const { mutate: createProgram, isPending: creating } = useCreateProgram();
  const { mutate: updateProgram, isPending: updating } = useUpdateProgram(id);
  const { mutateAsync: uploadImage, isPending: uploadingImage } = useAdminImageUpload();

  useEffect(() => {
    if (!existing || isNew) return;

    setForm({
      title: existing.title,
      description: existing.description ?? '',
      category: existing.category,
      startDate: toDateTimeLocal(existing.startDate),
      endDate: toDateTimeLocal(existing.endDate),
      totalSlots: existing.totalSlots === null ? '' : String(existing.totalSlots),
      bannerUrl: existing.bannerUrl ?? '',
      bannerAltText: existing.bannerAltText ?? '',
      registrationMode: existing.registrationMode,
      externalCtaLabel: existing.externalCtaLabel ?? '',
      externalCtaUrl: existing.externalCtaUrl ?? '',
      status: existing.status,
      isHighlightedOnHome: existing.isHighlightedOnHome,
    });

    setBuilderFields(deserializeDynamicFormSchema(existing.dynamicFormSchema));
  }, [existing, isNew]);

  const previewSchema = useMemo(() => serializeBuilderFields(builderFields), [builderFields]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name } = event.target;

    if (event.target instanceof HTMLInputElement && event.target.type === 'checkbox') {
      const { checked } = event.target;
      setForm((current) => ({ ...current, [name]: checked }) as ProgramFormData);
      return;
    }

    const { value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value } as ProgramFormData;

      if (name === 'status' && value !== 'published') {
        next.isHighlightedOnHome = false;
      }

      return next;
    });
  }

  function handleDescriptionChange(nextHtml: string) {
    setForm((current) => ({ ...current, description: nextHtml }));
  }

  async function uploadAdminImage(file: File): Promise<string> {
    const uploaded = await uploadImage(file);
    return uploaded.url;
  }

  async function handleBannerFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    try {
      const bannerUrl = await uploadAdminImage(file);
      setForm((current) => ({ ...current, bannerUrl }));
    } catch {
      setError('Erro ao enviar banner. Verifique o formato e tamanho da imagem.');
    }
  }

  function parseTotalSlotsForCreate(): number | undefined {
    if (form.totalSlots.trim() === '') return undefined;
    return Number(form.totalSlots);
  }

  function parseTotalSlotsForUpdate(): number | null {
    if (form.totalSlots.trim() === '') return null;
    return Number(form.totalSlots);
  }

  function validateBeforeSubmit(): boolean {
    if (!form.title.trim()) {
      setError('Título é obrigatório.');
      setActiveStep('base');
      return false;
    }

    if (!hasMeaningfulRichText(form.description)) {
      setError('Descrição é obrigatória.');
      setActiveStep('content');
      return false;
    }

    if (!form.startDate || !form.endDate) {
      setError('Data de início e término são obrigatórias.');
      setActiveStep('base');
      return false;
    }

    if (new Date(form.startDate) > new Date(form.endDate)) {
      setError('Data de início não pode ser posterior à data de término.');
      setActiveStep('base');
      return false;
    }

    if (form.totalSlots && Number(form.totalSlots) < 1) {
      setError('Total de vagas deve ser maior que zero.');
      setActiveStep('base');
      return false;
    }

    if (form.isHighlightedOnHome && form.status !== 'published') {
      setError('Somente programas publicados podem ficar ativos na página inicial.');
      setActiveStep('base');
      return false;
    }

    const hasExternalLabel = form.externalCtaLabel.trim().length > 0;
    const hasExternalUrl = form.externalCtaUrl.trim().length > 0;

    if (hasExternalLabel !== hasExternalUrl) {
      setError('CTA externo exige rótulo e URL juntos.');
      setActiveStep('mode');
      return false;
    }

    const dynamicValidation = validateBuilderFieldsByMode(form.registrationMode, builderFields);

    if (!dynamicValidation.isValid) {
      setError(dynamicValidation.issues[0] ?? 'Formulário dinâmico inválido.');
      setActiveStep('builder');
      return false;
    }

    return true;
  }

  function buildCreatePayload(): CreateProgramInput {
    const dynamicSchema = serializeBuilderFields(builderFields);
    const isInformativeMode = form.registrationMode === 'informative';

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category as CreateProgramInput['category'],
      startDate: toIsoDateTime(form.startDate),
      endDate: toIsoDateTime(form.endDate),
      totalSlots: parseTotalSlotsForCreate(),
      bannerUrl: form.bannerUrl.trim() || undefined,
      bannerAltText: form.bannerAltText.trim() || undefined,
      registrationMode: form.registrationMode,
      externalCtaLabel: isInformativeMode ? form.externalCtaLabel.trim() || undefined : undefined,
      externalCtaUrl: isInformativeMode ? form.externalCtaUrl.trim() || undefined : undefined,
      dynamicFormSchema: isInformativeMode ? undefined : dynamicSchema,
      status: form.status,
      isHighlightedOnHome: form.isHighlightedOnHome,
    };
  }

  function buildUpdatePayload(): UpdateProgramInput {
    const dynamicSchema = serializeBuilderFields(builderFields);
    const isInformativeMode = form.registrationMode === 'informative';

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category as UpdateProgramInput['category'],
      startDate: toIsoDateTime(form.startDate),
      endDate: toIsoDateTime(form.endDate),
      totalSlots: parseTotalSlotsForUpdate(),
      bannerUrl: form.bannerUrl.trim() || null,
      bannerAltText: form.bannerAltText.trim() || null,
      registrationMode: form.registrationMode,
      externalCtaLabel: isInformativeMode ? form.externalCtaLabel.trim() || null : null,
      externalCtaUrl: isInformativeMode ? form.externalCtaUrl.trim() || null : null,
      dynamicFormSchema: isInformativeMode ? null : (dynamicSchema ?? null),
      status: form.status,
      isHighlightedOnHome: form.isHighlightedOnHome,
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!validateBeforeSubmit()) return;

    if (isNew) {
      createProgram(buildCreatePayload(), {
        onSuccess: () => router.push('/app/admin/programas'),
        onError: () => setError('Erro ao criar programa.'),
      });
      return;
    }

    updateProgram(buildUpdatePayload(), {
      onSuccess: () => router.push('/app/admin/programas'),
      onError: () => setError('Erro ao atualizar programa.'),
    });
  }

  if (!isNew && isLoading) {
    return <p>Carregando...</p>;
  }

  const stepIndex = STEPS.findIndex((step) => step.id === activeStep);

  return (
    <div className="app-page">
      <div className="container">
        <div className="page-header">
          <h1>{isNew ? 'Novo Programa' : 'Editar Programa'}</h1>
          <a href="/app/admin/programas" className="btn-ghost">
            ← Voltar
          </a>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={activeStep === step.id ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveStep(step.id)}
            >
              {index + 1}. {step.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="admin-form p-4 sm:p-6">
          {activeStep === 'base' ? (
            <section className="space-y-4">
              <div className="field">
                <label htmlFor="title">Título *</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
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
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label
                  htmlFor="isHighlightedOnHome"
                  className="flex items-start gap-3 text-sm font-semibold text-slate-900"
                >
                  <input
                    id="isHighlightedOnHome"
                    name="isHighlightedOnHome"
                    type="checkbox"
                    checked={form.isHighlightedOnHome}
                    onChange={handleChange}
                    disabled={form.status !== 'published'}
                  />
                  Programa ativo na página inicial
                </label>
                <p className="mt-2 text-xs text-slate-500">
                  Apenas programas com status Publicado podem ser exibidos no bloco “Programa ativo”
                  da Home.
                </p>
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
                  <label htmlFor="endDate">Data de término *</label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="totalSlots">Total de vagas</label>
                <input
                  id="totalSlots"
                  name="totalSlots"
                  type="number"
                  min="1"
                  value={form.totalSlots}
                  onChange={handleChange}
                  placeholder="Vazio = ilimitado"
                />
              </div>
            </section>
          ) : null}

          {activeStep === 'content' ? (
            <section className="space-y-4">
              <div className="field">
                <label htmlFor="description">Descrição pública *</label>
                <RichTextEditor
                  value={form.description}
                  onChange={handleDescriptionChange}
                  onUploadImage={async (file) => {
                    setError(null);
                    try {
                      return await uploadAdminImage(file);
                    } catch {
                      setError(
                        'Erro ao enviar imagem da descrição. Verifique o formato e tamanho.',
                      );
                      throw new Error('Upload da imagem da descrição falhou');
                    }
                  }}
                />
              </div>

              <div className="field">
                <label htmlFor="bannerUpload">Banner do programa</label>
                <input
                  id="bannerUpload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBannerFileChange}
                  disabled={uploadingImage}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Formatos: JPG, PNG ou WebP. Tamanho máximo: 2MB.
                </p>

                {form.bannerUrl ? (
                  <div className="mt-3 space-y-2">
                    <img
                      src={form.bannerUrl}
                      alt={form.bannerAltText || 'Prévia do banner do programa'}
                      className="max-h-52 w-full rounded-2xl border border-slate-200 object-cover"
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setForm((current) => ({ ...current, bannerUrl: '' }))}
                    >
                      Remover banner
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="bannerAltText">Texto alternativo do banner</label>
                <input
                  id="bannerAltText"
                  name="bannerAltText"
                  value={form.bannerAltText}
                  onChange={handleChange}
                  placeholder="Descrição para acessibilidade"
                />
              </div>
            </section>
          ) : null}

          {activeStep === 'mode' ? (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">Modo de publicação</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <input
                      type="radio"
                      name="registrationMode"
                      value="registration"
                      checked={form.registrationMode === 'registration'}
                      onChange={handleChange}
                    />
                    Inscrição
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <input
                      type="radio"
                      name="registrationMode"
                      value="informative"
                      checked={form.registrationMode === 'informative'}
                      onChange={handleChange}
                    />
                    Informativo
                  </label>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Modo informativo não exibe botão de inscrição. Modo inscrição exige formulário
                  dinâmico válido.
                </p>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="externalCtaLabel">Rótulo CTA externo</label>
                  <input
                    id="externalCtaLabel"
                    name="externalCtaLabel"
                    value={form.externalCtaLabel}
                    onChange={handleChange}
                    placeholder="Ex: Saiba mais"
                    disabled={form.registrationMode !== 'informative'}
                  />
                </div>

                <div className="field">
                  <label htmlFor="externalCtaUrl">URL CTA externo</label>
                  <input
                    id="externalCtaUrl"
                    name="externalCtaUrl"
                    type="url"
                    value={form.externalCtaUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    disabled={form.registrationMode !== 'informative'}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {activeStep === 'builder' ? (
            <section className="space-y-4">
              <DynamicFormBuilder fields={builderFields} onChange={setBuilderFields} />
              <DynamicFormPreview mode={form.registrationMode} schema={previewSchema} />
            </section>
          ) : null}

          {error ? <div className="form-error mt-4">{error}</div> : null}

          <div className="form-actions mt-5 flex-wrap justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const previousStep = STEPS[stepIndex - 1];
                  if (previousStep) setActiveStep(previousStep.id);
                }}
                disabled={stepIndex <= 0}
              >
                ← Etapa anterior
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const nextStep = STEPS[stepIndex + 1];
                  if (nextStep) setActiveStep(nextStep.id);
                }}
                disabled={stepIndex >= STEPS.length - 1}
              >
                Próxima etapa →
              </button>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={creating || updating || uploadingImage}
            >
              {creating || updating
                ? 'Salvando...'
                : uploadingImage
                  ? 'Enviando imagem...'
                  : isNew
                    ? 'Criar programa'
                    : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
