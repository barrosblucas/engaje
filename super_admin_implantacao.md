# Plano: Super Admin de Eventos/Programas com Form Builder Dinâmico + CTA de Presença

## Resumo
Vamos evoluir o fluxo de criação no super admin para suportar:
1. Criação/edição de **Eventos** e **Programas** com página rica de conteúdo público.
2. **Form builder dinâmico** (estilo Google Forms) para inscrições.
3. Escolha por item entre **Inscrição oficial** ou **Informativo** (com CTA externo opcional).
4. CTA em eventos **"Vou ir com certeza"** com contador persistente, exigindo login (decisão tomada para respeitar hard rules).

## Arquivos-alvo (3 blocos)
- `packages/contracts/src/index.ts`, `prisma/schema.prisma`, `prisma/migrations/*`.
- `apps/api/src/admin/*`, `apps/api/src/public/*`, `apps/api/src/registrations/*`, `apps/api/src/app.module.ts`.
- `apps/web/src/app/app/admin/*`, `apps/web/src/app/public/*`, `apps/web/src/shared/hooks/*`, `.context/docs/REPOMAP.md`, `.context/docs/PROJECT_STATE.md`, `.context/docs/changelog/CHANGELOG_2026_02_24.md`.

## Mudanças de API/Contratos/Tipos (públicos e internos)
1. Contratos novos/alterados em `packages/contracts`:
- `RegistrationModeSchema`: `'registration' | 'informative'`.
- `DynamicFormFieldTypeSchema`: `short_text | paragraph | number | single_select | multi_select | checkbox | date | terms`.
- `DynamicFormFieldSchema`: `id`, `type`, `label`, `required`, `placeholder?`, `helpText?`, `options?`, `validation?`.
- `DynamicFormSchema`: `fields: DynamicFormField[]`.
- `CreateEventInputSchema`/`UpdateEventInputSchema` com `registrationMode`, `externalCtaLabel?`, `externalCtaUrl?`, `dynamicFormSchema?`.
- `EventDetailSchema` e resposta pública de detalhe com metadados de modo de inscrição e CTA.
- Contratos de Programas:
`CreateProgramInputSchema`, `UpdateProgramInputSchema`, `AdminProgramListResponseSchema`, `PublicProgramsResponseSchema`, `PublicProgramDetailResponseSchema`.
- `CreateRegistrationInputSchema` ampliado para `eventId` + `formData?`.

2. Banco (Prisma):
- `Event` recebe `registrationMode`, `externalCtaLabel?`, `externalCtaUrl?`, `dynamicFormSchema Json?`.
- `Registration` recebe `formData Json?`.
- `Program` mantém `formSchema` e recebe alinhamento com `registrationMode`/CTA externo.
- Novo modelo de intenção confirmada de presença por usuário em evento (1 por usuário/evento) para contador confiável.
- Ajuste de relação de `ProgramRegistration` com `User` para consistência de domínio autenticado.

3. Endpoints:
- Admin autenticado:
`POST/GET/PATCH /v1/admin/events` (payload expandido),
`POST/GET/PATCH /v1/admin/programs`.
- Público read-only:
`GET /v1/public/events`, `GET /v1/public/events/:slug` (com modo/CTA/form),
`GET /v1/public/programs`, `GET /v1/public/programs/:slug`.
- Autenticado:
`POST /v1/registrations` aceitando `formData`,
`POST /v1/events/:id/attendance-intents`,
`DELETE /v1/events/:id/attendance-intents`,
`GET /v1/events/:id/attendance-intents/me` (estado do botão no front autenticado).

## Implementação (frontend + backend)
1. Admin Web (SPA client-only em `/app/*`):
- Criar seção de gestão para programas.
- Refatorar formulário de evento para layout em etapas:
Dados base, Conteúdo público, Inscrição/Informativo, Builder de campos.
- Builder v1 sem DnD livre: adicionar/remover/editar/reordenar campos por controles de ordenação.
- Preview do formulário final no próprio admin.
- Validação de consistência:
modo `informative` não exige `dynamicFormSchema`,
modo `registration` exige schema válido.

2. Público Web:
- Evoluir `/public/eventos/[slug]` para renderizar inscrição dinâmica quando `registrationMode=registration`.
- Quando `informative`, ocultar inscrição e mostrar CTA externo (se configurado).
- Adicionar botão "Vou ir com certeza" para eventos com contador e estado do usuário logado.
- Criar `/public/programas/[slug]` com mesma estrutura visual de detalhe e CTA conforme modo.

3. API:
- Services/repos com validação Zod na borda.
- Controllers finos, regra no service, prisma isolado.
- Regras de autorização mantidas por guard.
- Rate limit e padrão de erro mantidos nas rotas públicas `GET`.

## Testes e cenários
1. Contratos:
- Schema tests para `DynamicFormSchema` e `RegistrationMode`.
- Casos inválidos: select sem opções, campo obrigatório sem label, URL externa inválida.

2. API (Jest/Supertest):
- Admin cria evento/programa em modo inscrição com schema dinâmico válido.
- Admin cria em modo informativo sem schema e com CTA externo.
- Público lê detalhes corretos conforme modo.
- Registro de inscrição salva `formData` e valida obrigatórios.
- CTA presença: cria/remover intenção, evita duplicidade por usuário/evento.

3. Web (Vitest):
- Utilitários de mapeamento do builder.
- Serialização/desserialização de campos dinâmicos.
- Regras de habilitação/desabilitação de botões por modo.

## Assumptions e defaults escolhidos
- Referência visual (PDF + Sympla) será usada como inspiração estrutural, sem cópia literal.
- V1 do builder usa "blocos + ordenar", não drag-and-drop completo.
- V1 sem upload de arquivo.
- Eventos e programas compartilham o mesmo schema de form builder.
- CTA "Vou ir com certeza" exige login (decisão para aderir às hard rules de segurança/governança).
- Programas terão página pública de detalhe individual.
- Ao final da implementação: atualizar `REPOMAP`, `PROJECT_STATE` e registrar a entrega em `.context/docs/changelog/CHANGELOG_2026_02_24.md`.
- Checklist obrigatório de entrega: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
