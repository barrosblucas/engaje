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
- `src/admin/events/*` — Fluxo autenticado de gestao de eventos e export CSV.

## apps/web (Next.js 15 App Router)
- `postcss.config.mjs` — Pipeline PostCSS com plugin `@tailwindcss/postcss` para Tailwind v4.
- `next.config.ts` — Config base do Next com `distDir` isolado no desenvolvimento (`.next-dev`) para evitar colisao de artefatos com build/typecheck.
- `src/app/page.tsx` — Redirect da raiz `/` para `/public`.
- `src/app/login/page.tsx` — Login publico com layout visual em duas colunas (mapa animado + formulario) mantendo auth SPA client-side.
- `src/app/login/dot-map-canvas.tsx` + `src/app/login/login-redirect.ts` — Componente visual do mapa e helper de redirect seguro (anti open-redirect).
- `src/app/app/dashboard/page.tsx` — Rota de dashboard (ponte) com redirect para `/app/inscricoes`.
- `src/app/public/page.tsx` — Nova Home institucional publica (hero, categorias, destaques, noticias e microinteracoes).
- `src/app/public/eventos/*` — Agenda publica SEO-first + detalhe de evento com CTA de inscricao.
- `src/app/public/programas/page.tsx` — Vitrine publica de iniciativas e programas municipais.
- `src/app/public/contato/page.tsx` — Pagina publica de contato institucional e FAQ.
- `src/components/public/home/*` — Secoes da Home publica (hero, categorias, eventos, banner, stats, noticias, engajamento).
- `src/components/ui/*` — Design system base (`Button`, `Card`, `Badge`, `Input`, `Select`, `DatePicker`, `Modal`, `Toast`, `Skeleton`, `ProgressBar`, `Avatar`, `Chip`, `Accordion`, `Timeline`).
- `src/components/public/theme-toggle.tsx` — Toggle manual de tema com fallback para `prefers-color-scheme`.
- `src/components/public/public-header.tsx` — Header institucional com menu responsivo e bottom tab bar mobile.
- `src/components/public/public-footer.tsx` — Rodape institucional com links e canais oficiais.
- `src/lib/public-events.ts` — Utilitarios de categoria/data/vagas para dominio de eventos publicos.
- `src/lib/cn.ts` — Helper para composicao de classes CSS.
- `src/components/public/home/home-utils.spec.ts` — Testes Vitest dos utilitarios da Home.
- `src/shared/api-client.ts` — Cliente HTTP com `credentials: "include"` e fallback dinamico para host local atual (`window.location.hostname`) quando `NEXT_PUBLIC_API_URL` nao estiver definido.
- `src/middleware.ts` — Protecao de `/app/*` redirecionando para `/login?redirect=...`.

## packages/contracts
- `src/index.ts` — SSOT de schemas Zod dos dominios Auth, Public Events, Admin Events e Registrations.
- `src/index.spec.ts` — Testes de contratos (CPF, defaults de query publica e validacao de role admin).

## packages/utils
- `src/index.ts` — Helpers puros (`formatDateBR`, `truncate`).
- `src/index.spec.ts` — Testes unitarios dos helpers puros.

## prisma
- `schema.prisma` — Modelos do dominio de usuarios, eventos e inscricoes.

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
