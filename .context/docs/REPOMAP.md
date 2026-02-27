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
- `src/main.ts` — Bootstrap Nest com prefixo global `v1`, `cookie-parser`, `express-session`, `passport`, logger `pino` e bind configuravel por `HOST` (fallback `0.0.0.0`) para acesso LAN no dev.
- `src/config/app-origins.ts` — SSOT de origins do app para CORS/redirect (`APP_URLS` + fallback `APP_URL`).
- `src/config/app-logger.ts` + `src/config/nest-logger.ts` + `src/config/http-logging.middleware.ts` — Logger estruturado com nivel dinâmico por ambiente e log HTTP com `request-id`.
- `scripts/ensure-safe-test-db.cjs` — Guard para bloquear testes da API quando `DATABASE_URL` não aponta para banco de teste.
- `src/public/events/*` — Endpoints publicos `GET /v1/public/events*`.
- `src/public/programs/*` — Endpoints publicos `GET /v1/public/programs*` + `GET /v1/public/programs/active`.
- `src/public/platform-stats/*` — Endpoint publico `GET /v1/public/platform-stats` com contadores agregados reais da plataforma (eventos publicados, inscricoes confirmadas e programas ativos).
- `src/auth/*` — Fluxos de autenticacao e conta:
  - login/logout/sessao (`/v1/auth/login`, `/v1/auth/logout`, `/v1/auth/me`),
  - perfil autenticado (`PATCH /v1/auth/profile`),
  - troca de senha autenticada (`PATCH /v1/auth/password`),
  - recuperacao de senha por e-mail com token (`POST /v1/auth/password/forgot`, `POST /v1/auth/password/reset`),
  - OAuth Google com guard dedicado que retorna `503` quando credenciais Google nao estao configuradas no ambiente.
- `src/admin/events/*` — Fluxo autenticado de gestao de eventos e exportacoes.
  - inclui listagem, detalhe (`GET /v1/admin/events/:id`), edicao, status, imagens e inscritos.
  - `GET /v1/admin/events/:id/registrations` agora retorna `formData` das inscricoes e ordena candidatos por cadastro ascendente.
  - `GET /v1/admin/events/:id/registrations/export` mantém exportacao em CSV.
- `src/admin/programs/*` — Fluxo autenticado de gestao de programas (listagem, detalhe, criacao e edicao), incluindo controle de programa ativo da Home.
- `src/admin/users/*` — Fluxo autenticado para criacao de usuarios gerenciados (`POST /v1/admin/users`) com permissao por papel (`admin` x `super_admin`).
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
- `src/app/esqueci-senha/page.tsx` — Solicitação pública de recuperação de senha com aviso explícito de expiração do link em 2h.
- `src/app/redefinir-senha/page.tsx` — Redefinição pública de senha via token recebido por e-mail.
- `src/app/login/dot-map-canvas.tsx` + `src/app/login/login-redirect.ts` — Componente visual do mapa e helper de redirect seguro (anti open-redirect).
- `src/app/app/dashboard/page.tsx` — Rota de dashboard (ponte) com redirect por perfil (`admin/super_admin` -> `/app/admin/eventos`, `citizen` -> `/app/inscricoes`).
- `src/app/app/perfil/page.tsx` — Tela autenticada para atualização de nome/e-mail/celular e alteração de senha (CPF somente leitura).
- `src/app/public/page.tsx` — Home institucional publica (hero, categorias, destaques e microinteracoes), com fetch de `GET /v1/public/programs/active` para o bloco `Programa ativo` e `GET /v1/public/platform-stats` para o painel `Engajamento da cidade`.
- `src/app/public/eventos/*` — Agenda publica SEO-first + detalhe de evento com CTA para fluxo autenticado de inscricao.
- `src/app/app/inscricoes/nova/[slug]/page.tsx` — Tela autenticada (SPA) para inscricao dinamica por evento (slug).
- `src/app/app/inscricoes/[id]/page.tsx` — Tela autenticada (SPA) de comprovante da inscricao com respostas preenchidas.
- `src/app/public/programas/page.tsx` — Listagem publica de programas consumindo `/v1/public/programs`.
- `src/app/public/programas/[slug]/page.tsx` — Detalhe publico de programa com modo inscricao/informativo.
- `src/app/public/contato/page.tsx` — Pagina publica de contato institucional e FAQ.
- `src/app/app/admin/eventos/[id]/page.tsx` — Formulario de evento em etapas com builder dinamico + preview.
- `src/app/app/admin/eventos/[id]/inscricoes/page.tsx` — Lista SPA de inscritos com enumeração cronológica, popup de detalhes ao clicar na linha e botao de exportacao em PDF.
- `src/app/app/admin/programas/*` — Gestao SPA de programas com form builder dinamico e seletor de destaque para Home.
- `src/app/app/admin/usuarios/page.tsx` — Tela SPA para criação de usuários com função `Administrador` ou `Comum`.
- `src/components/dynamic-form/*` — Builder, renderizacao de campos dinamicos e preview.
- `src/components/editor/rich-text-editor.tsx` — Editor rico baseado em Tiptap (Simple Editor) para campos de descricao publica com toolbar e upload de imagens.
- `src/components/events/attendance-intent-button.tsx` — Botao `Vou ir com certeza` com contador persistente.
- `src/components/admin/registration-details-modal.tsx` — Modal de detalhes da inscricao no admin com dados pessoais e respostas do formulario dinamico.
- `src/components/public/home/*` — Secoes da Home publica (hero, categorias, eventos, banner, stats e engajamento), com CTA `Inscrever-se` dos cards apontando para `/app/inscricoes/nova/[slug]` e CTA `Quero participar` do programa ativo apontando para `/public/programas/[slug]` (sem modal).
- `src/components/ui/*` — Design system base (`Button`, `Card`, `Badge`, `Input`, `Select`, `DatePicker`, `Modal`, `Toast`, `Skeleton`, `ProgressBar`, `Avatar`, `Chip`, `Accordion`, `Timeline`).
- `src/components/public/theme-toggle.tsx` — Toggle manual de tema com fallback para `prefers-color-scheme`.
- `src/components/public/public-header.tsx` — Header institucional com menu responsivo e bottom tab bar mobile.
- `src/components/public/public-header-auth.ts` — Regras puras do estado de autenticação no header público (anon vs logado), incluindo destino canônico pós-logout (`/public`).
- `src/components/public/public-header-auth.spec.ts` — Testes Vitest das regras do menu logado e resolução de dashboard por papel.
- `src/components/public/public-footer.tsx` — Rodape institucional com links/canais oficiais e icones sociais para Facebook, Instagram e site institucional.
- `src/components/public/public-footer-links.ts` — Constantes dos links oficiais de redes sociais e portal institucional usados no rodape.
- `src/components/public/public-footer-links.spec.ts` — Testes Vitest garantindo URLs oficiais do rodape e ausencia do atalho legado de WhatsApp.
- `src/components/public/public-share-actions.tsx` — Bloco client-side reutilizavel de compartilhamento (WhatsApp, Instagram, Facebook e copiar link) para detalhes publicos.
- `src/lib/public-events.ts` — Utilitarios de categoria/data/vagas para dominio de eventos publicos, com formatacao de data/hora fixada em `America/Campo_Grande`.
- `src/lib/public-events.spec.ts` — Testes Vitest de regras de vagas e regressao de timezone (`UTC` -> horario local de Campo Grande).
- `src/lib/public-api-base.ts` — Resolver de origem da API para rotas publicas SSR/ISR (prioriza `INTERNAL_API_URL`, depois `NEXT_PUBLIC_API_URL` e fallback localhost).
- `src/lib/public-api-base.spec.ts` — Testes Vitest cobrindo prioridades e fallback do resolver de origem da API publica.
- `src/lib/public-share.ts` — Helpers de URL absoluta publica e links de compartilhamento social.
- `src/lib/public-share.spec.ts` — Testes Vitest para resolver de URL publica e geracao de links de compartilhamento.
- `src/lib/registration-answers.ts` — Helpers para formatacao/mapeamento das respostas de inscricao e numeracao dos candidatos.
- `src/lib/registration-answers.spec.ts` — Testes Vitest para mapeamento de respostas, ordenacao cronologica e calculo de enumeracao.
- `src/lib/admin-registrations-pdf.ts` — Gerador de PDF client-side para inscricoes admin com bloco por candidato enumerado.
- `src/lib/admin-registrations-pdf.spec.ts` — Teste Vitest do nome de arquivo gerado para exportacao PDF.
- `src/lib/rich-text.ts` — Sanitizacao defensiva para render de HTML rico e normalizacao de URLs de upload (`/uploads/*`) quando houver origem de API configurada.
- `src/lib/cn.ts` — Helper para composicao de classes CSS.
- `src/components/public/home/home-utils.spec.ts` — Testes Vitest dos utilitarios da Home.
- `src/lib/rich-text.spec.ts` — Testes Vitest de sanitizacao/normalizacao de HTML rico e URLs de imagem.
- `src/shared/api-client.ts` — Cliente HTTP com `credentials: "include"` e resolvedor de origem da API: prioriza `NEXT_PUBLIC_API_URL`; em `development` usa `hostname:3200` apenas para hosts locais/LAN e para dominios publicos cai em same-origin (`window.location.origin`).
- `src/shared/api-client.spec.ts` — Testes Vitest do resolvedor de origem da API (prioridade de env, fallback local/LAN em dev e fallback same-origin para dominios publicos).
- `src/shared/hooks/use-admin.ts` — Hooks admin consumindo `/admin/events*`, `/admin/programs*` e `/admin/users`, incluindo mutacao para alternar programa ativo na Home e exportacao de inscricoes em PDF.
- `src/shared/hooks/use-auth.ts` — Hooks de auth para sessão, perfil, troca de senha e recuperação de senha por token.
- `src/shared/hooks/use-events.ts` — Hooks publicos/autenticados para eventos, programas, inscricoes (lista, detalhe, criacao, cancelamento) e attendance intents.
- `src/shared/dynamic-form/*` — Utilitarios de serializacao/deserializacao e regras de modo para o builder.
- `src/middleware.ts` — Protecao de `/app/*` redirecionando para `/login?redirect=...`.

## packages/contracts
- `src/index.ts` — SSOT de schemas Zod dos dominios Auth, Events, Programs, Dynamic Form, Registrations e Attendance Intents (inclui `UpdateProfileInputSchema`, `ChangePasswordInputSchema`, `RequestPasswordReset*`, `ResetPasswordInputSchema`, `CreateManagedUserInputSchema`, `isHighlightedOnHome`, `PublicActiveProgramResponseSchema`, `PublicPlatformStatsResponseSchema` e `formData` no contrato de inscricao admin).
- `src/index.spec.ts` — Testes de contratos (CPF, defaults, registration mode, dynamic form, validacoes de CTA/schema, destaque de programa na Home e novos contratos de perfil/senha/usuario gerenciado).
- `vitest.config.ts` — Config do Vitest priorizando fontes `.ts` em `src/`.

## packages/utils
- `src/index.ts` — Helpers puros (`formatDateBR`, `truncate`).
- `src/index.spec.ts` — Testes unitarios dos helpers puros.

## prisma
- `schema.prisma` — Modelos do dominio com eventos/programas, modos de inscricao, `form_data`, `event_attendance_intents` e flag `programs.is_highlighted_on_home`.
- `migrations/20260224123000_super_admin_form_builder_attendance` — Migration da Fase Super Admin (registration mode, dynamic schema e intents).
- `migrations/20260225113000_add_program_home_highlight` — Migration para suporte ao `Programa ativo` da Home com indice por destaque/status.
- `migrations/20260226200000_add_password_reset_tokens` — Migration para fluxo de recuperação de senha (`password_reset_tokens` com hash, expiração e uso único).

## Testes de integracao relevantes
- `apps/api/src/admin/events/admin-events.spec.ts` — Cobre `GET /v1/admin/events/:id` (sucesso, 404 e acesso negado para cidadao) e `GET /v1/admin/events/:id/registrations` (ordem cronologica, retorno de `formData` e acesso negado para cidadao).
- `apps/api/src/admin/users/admin-users.spec.ts` — Cobre `POST /v1/admin/users` para criação de comum/admin e regras de permissão por papel.
- `apps/api/src/auth/auth.spec.ts` — Cobre login/sessão e fluxos de perfil, troca de senha e recuperação de senha por token.
- `apps/api/src/super-admin-plan.spec.ts` — Cobre fluxo integrado de eventos/programas, inscricao com `formData` e attendance intents.
- `apps/api/src/public/platform-stats/public-platform-stats.spec.ts` — Cobre agregacao real do endpoint `GET /v1/public/platform-stats`.

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
