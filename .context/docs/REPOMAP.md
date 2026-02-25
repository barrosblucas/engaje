# REPOMAP — Engaje Portal

## Visao geral do repositorio
Mapa vivo do repositorio Engaje. Atualize sempre que estruturas, rotas ou contratos mudarem.

---

## Raiz
- `apps/` — Artefatos deployaveis.
- `packages/` — Bibliotecas compartilhadas (contracts, utils).
- `prisma/` — Schema e migracoes Postgres.
- `scripts/` — Checks de governanca (file-length, prisma-migration, no-console).
- `.context/` — Wiki viva (docs, agents, changelog).

## apps/api (NestJS, prefixo `v1`)
- `src/main.ts` — Bootstrap Nest com prefixo global `v1`, `cookie-parser`, `express-session`, `passport` e logger `pino`.
- `src/config/app-origins.ts` — SSOT de origins do app para CORS/redirect (`APP_URLS` + fallback `APP_URL`).
- `src/config/app-logger.ts` + `src/config/nest-logger.ts` + `src/config/http-logging.middleware.ts` — Logger estruturado com nivel dinâmico por ambiente e log HTTP com `request-id`.
- `src/public/events/*` — Endpoints publicos `GET /v1/public/events*`.
- `src/public/programs/*` — Endpoints publicos `GET /v1/public/programs*` + `GET /v1/public/programs/active`.
- `src/admin/events/*` — Fluxo autenticado de gestao de eventos e export CSV.
  - inclui listagem, detalhe (`GET /v1/admin/events/:id`), edicao, status, imagens e inscritos.
- `src/admin/programs/*` — Fluxo autenticado de gestao de programas (listagem, detalhe, criacao e edicao), incluindo controle de programa ativo da Home.
- `src/events/attendance-intents.*` — Endpoints autenticados para CTA de presenca:
  - `POST /v1/events/:id/attendance-intents`
  - `DELETE /v1/events/:id/attendance-intents`
  - `GET /v1/events/:id/attendance-intents/me`
- `src/registrations/*` — Inscricao autenticada de eventos com `formData` dinamico, listagem e detalhe do comprovante (`GET /v1/registrations/:id`).

## apps/web (Next.js 15 App Router)
- `postcss.config.mjs` — Pipeline PostCSS com plugin `@tailwindcss/postcss` para Tailwind v4.
- `next.config.ts` — Config do Next com `distDir` isolado, proxy/rewrite de `/uploads/*` para a API (`NEXT_PUBLIC_API_URL`) e allowlist dinâmica de imagens remotas do backend.
- `src/app/page.tsx` — Redirect da raiz `/` para `/public`.
- `src/app/login/page.tsx` — Login publico com layout visual em duas colunas (mapa animado + formulario) mantendo auth SPA client-side.
- `src/app/login/dot-map-canvas.tsx` + `src/app/login/login-redirect.ts` — Componente visual do mapa e helper de redirect seguro (anti open-redirect).
- `src/app/app/dashboard/page.tsx` — Rota de dashboard (ponte) com redirect por perfil (`admin/super_admin` -> `/app/admin/eventos`, `citizen` -> `/app/inscricoes`).
- `src/app/public/page.tsx` — Home institucional publica (hero, categorias, destaques e microinteracoes), com fetch de `GET /v1/public/programs/active` para o bloco `Programa ativo`.
- `src/app/public/eventos/*` — Agenda publica SEO-first + detalhe de evento com CTA para fluxo autenticado de inscricao.
- `src/app/app/inscricoes/nova/[slug]/page.tsx` — Tela autenticada (SPA) para inscricao dinamica por evento (slug).
- `src/app/app/inscricoes/[id]/page.tsx` — Tela autenticada (SPA) de comprovante da inscricao com respostas preenchidas.
- `src/app/public/programas/page.tsx` — Listagem publica de programas consumindo `/v1/public/programs`.
- `src/app/public/programas/[slug]/page.tsx` — Detalhe publico de programa com modo inscricao/informativo.
- `src/app/public/contato/page.tsx` — Pagina publica de contato institucional e FAQ.
- `src/app/app/admin/eventos/[id]/page.tsx` — Formulario de evento em etapas com builder dinamico + preview.
- `src/app/app/admin/programas/*` — Gestao SPA de programas com form builder dinamico e seletor de destaque para Home.
- `src/components/dynamic-form/*` — Builder, renderizacao de campos dinamicos e preview.
- `src/components/editor/rich-text-editor.tsx` — Editor rico baseado em Tiptap (Simple Editor) para campos de descricao publica com toolbar e upload de imagens.
- `src/components/events/attendance-intent-button.tsx` — Botao `Vou ir com certeza` com contador persistente.
- `src/components/public/home/*` — Secoes da Home publica (hero, categorias, eventos, banner, stats e engajamento).
- `src/components/ui/*` — Design system base (`Button`, `Card`, `Badge`, `Input`, `Select`, `DatePicker`, `Modal`, `Toast`, `Skeleton`, `ProgressBar`, `Avatar`, `Chip`, `Accordion`, `Timeline`).
- `src/components/public/theme-toggle.tsx` — Toggle manual de tema com fallback para `prefers-color-scheme`.
- `src/components/public/public-header.tsx` — Header institucional com menu responsivo e bottom tab bar mobile.
- `src/components/public/public-footer.tsx` — Rodape institucional com links e canais oficiais.
- `src/lib/public-events.ts` — Utilitarios de categoria/data/vagas para dominio de eventos publicos.
- `src/lib/public-events.spec.ts` — Testes Vitest da regra de visibilidade de vagas por modo (`registration` x `informative`).
- `src/lib/rich-text.ts` — Sanitizacao defensiva para render de HTML rico e normalizacao de URLs de upload (`/uploads/*`) quando houver origem de API configurada.
- `src/lib/cn.ts` — Helper para composicao de classes CSS.
- `src/components/public/home/home-utils.spec.ts` — Testes Vitest dos utilitarios da Home.
- `src/lib/rich-text.spec.ts` — Testes Vitest de sanitizacao/normalizacao de HTML rico e URLs de imagem.
- `src/shared/api-client.ts` — Cliente HTTP com `credentials: "include"` e fallback dinamico para host local atual (`window.location.hostname`) quando `NEXT_PUBLIC_API_URL` nao estiver definido.
- `src/shared/hooks/use-admin.ts` — Hooks admin consumindo `/admin/events*` e `/admin/programs*`, incluindo mutacao para alternar programa ativo na Home.
- `src/shared/hooks/use-events.ts` — Hooks publicos/autenticados para eventos, programas, inscricoes (lista, detalhe, criacao, cancelamento) e attendance intents.
- `src/shared/dynamic-form/*` — Utilitarios de serializacao/deserializacao e regras de modo para o builder.
- `src/middleware.ts` — Protecao de `/app/*` redirecionando para `/login?redirect=...`.

## packages/contracts
- `src/index.ts` — SSOT de schemas Zod dos dominios Auth, Events, Programs, Dynamic Form, Registrations e Attendance Intents (inclui `isHighlightedOnHome` e `PublicActiveProgramResponseSchema`).
- `src/index.spec.ts` — Testes de contratos (CPF, defaults, registration mode, dynamic form, validacoes de CTA/schema e destaque de programa na Home).
- `vitest.config.ts` — Config do Vitest priorizando fontes `.ts` em `src/`.

## packages/utils
- `src/index.ts` — Helpers puros (`formatDateBR`, `truncate`).
- `src/index.spec.ts` — Testes unitarios dos helpers puros.

## prisma
- `schema.prisma` — Modelos do dominio com eventos/programas, modos de inscricao, `form_data`, `event_attendance_intents` e flag `programs.is_highlighted_on_home`.
- `migrations/20260224123000_super_admin_form_builder_attendance` — Migration da Fase Super Admin (registration mode, dynamic schema e intents).
- `migrations/20260225113000_add_program_home_highlight` — Migration para suporte ao `Programa ativo` da Home com indice por destaque/status.

## Testes de integracao relevantes
- `apps/api/src/admin/events/admin-events.spec.ts` — Cobre `GET /v1/admin/events/:id` (sucesso, 404 e acesso negado para cidadao).
- `apps/api/src/super-admin-plan.spec.ts` — Cobre fluxo integrado de eventos/programas, inscricao com `formData` e attendance intents.

## Documentacao
- `.context/docs/AI-GOVERNANCE.md` — Guardrails AI/contract-first.
- `.context/docs/PROJECT_STATE.md` — Estado atual e roadmap.
- `.context/docs/architecture.md` — Visao arquitetural.
- `.context/docs/changelog/CHANGELOG_YYYY_MM_DD.md` — Registro diario obrigatorio.

## Stack tecnologica

| Camada          | Tecnologia                                          |
| --------------- | --------------------------------------------------- |
| Linguagem       | TypeScript 5.x strict — Node.js 24 LTS             |
| Backend         | NestJS 10, Prisma 7+, Zod, Pino                     |
| Frontend        | Next.js 15 App Router, TailwindCSS v4, shadcn/ui   |
| Auth cidadao    | Better Auth (credentials CPF+senha + OAuth Google) |
| Auth admin      | Sessao NestJS separada — AdminUser + email allowlist |
| Banco de dados  | PostgreSQL 17+ (Prisma), Redis (cache + BullMQ)    |
| Fila de e-mails | BullMQ + Nodemailer (retry 3x exponencial)         |
| Monorepo        | pnpm workspaces + Turborepo                         |
| Lint / Format   | Biome (substitui ESLint + Prettier)                 |
| Testes          | Vitest (packages + web), Jest + Supertest (api)    |

---

## Branches

| Branch | Status | Descricao |
| :--- | :--- | :--- |
| `main` | estavel | Base do projeto |
| `dev` | desenvolvimento | Base de integracao |

---

## Entidades principais (resumo)
- **Event** — eventos municipais com formulario dinamico opcional.
- **Program** — programas municipais com formulario dinamico obrigatorio.
- **Citizen** — cidadao com CPF validado + autenticacao Better Auth.
- **Registration** — inscricao em evento (protocolo + QR code).
- **ProgramRegistration** — inscricao em programa (protocolo + QR code).
- **AdminUser** — gestor municipal (unico papel, email allowlist).
- **NotificationLog** — rastreamento de e-mails enviados/falhados.

---

## Convencoes de codigo
- Cada modulo NestJS: `.module.ts`, `.controller.ts`, `.service.ts`, `.repo.ts`, `.schema.ts`.
- Controllers finos: validam input, delegam ao service e mapeiam response.
- Services: regra de negocio, validacao Zod e transacoes Prisma.
- Repos: unico ponto de acesso ao Prisma; transactions quando multiplas entidades.
- `packages/contracts`: source of truth dos schemas Zod (importado em api e web).
- Arquivos: maximo 400 linhas (CI bloqueia se exceder).
- Sem `console.log` em prod (CI bloqueia).
