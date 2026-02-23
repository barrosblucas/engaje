# REPOMAP — Engaje Portal


## Visão geral do repositório

Mapa vivo do repositório Engaje. Atualize sempre que estruturas, rotas ou contratos mudarem.



---

## Raiz
- `apps/` — Artefatos deployáveis.
- `packages/` — Bibliotecas compartilhadas (contracts, utils).
- `prisma/` — Schema e migrações Postgres.
- `scripts/` — Checks de governança (file-length, prisma-migration, no-console).
- `.context/` — Wiki viva (docs, agents, changelog).

## apps/api (NestJS, prefixo `v1`)
- `src/main.ts` — Bootstrap com pino-http, Swagger e prefixo global `v1`.

## apps/web (Nextjs 15 App Router)
- `src/main.tsx` — Entrada do app.

## packages/contracts
- `src/users/contracts.ts` — Schemas Zod: `UserSchema`, `CreateUserInputSchema`, 
## packages/utils
- `src/index.ts` — Helpers puros (placeholder no starter).

## prisma
- `schema.prisma` — Modelos:

## Documentação
- `.context/docs/AI-GOVERNANCE.md` — Guardrails AI/contract-first.
- `.context/docs/PROJECT_STATE.md` — Estado atual e roadmap.
- `.context/docs/architecture.md` — Visão arquitetural.
- `.context/docs/changelog/CHANGELOG_YYYY_MM_DD.md` — Registro diário obrigatório.

## Stack tecnológica

| Camada          | Tecnologia                                          |
| --------------- | --------------------------------------------------- |
| Linguagem       | TypeScript 5.x strict — Node.js 24 LTS             |
| Backend         | NestJS 10, Prisma 7+, Zod, Pino                     |
| Frontend        | Next.js 15 App Router, TailwindCSS v4, shadcn/ui   |
| Auth cidadão    | Better Auth (credentials CPF+senha + OAuth Google)  |
| Auth admin      | Sessão NestJS separada — AdminUser + email allowlist |
| Banco de dados  | PostgreSQL 17+ (Prisma), Redis (cache + BullMQ)         |
| Fila de e-mails | BullMQ + Nodemailer (retry 3x exponencial)          |
| Monorepo        | pnpm workspaces + Turborepo                         |
| Lint / Format   | Biome (substitui ESLint + Prettier)                 |
| Testes          | Vitest (packages), Jest + Supertest (api), Playwright (web) |

---

## Branches

| Branch                | Status   | Descrição                             |
| --------------------- | -------- | ------------------------------------- |
| `main`                | estável  | Base do projeto                       |
| `dev`                 | desenvolvimento  | Base do projeto               |


---

## Entidades principais (resumo)

- **Event** — eventos municipais com formulário dinâmico opcional
- **Program** — programas municipais com formulário dinâmico obrigatório
- **Citizen** — cidadão com CPF validado + autenticação Better Auth
- **Registration** — inscrição em evento (protocolo + QR code)
- **ProgramRegistration** — inscrição em programa (protocolo + QR code)
- **AdminUser** — gestor municipal (único papel, email allowlist)
- **NotificationLog** — rastreamento de e-mails enviados/falhados

---

## Convenções de código

- Cada módulo NestJS: `.module.ts`, `.controller.ts`, `.service.ts`, `.repo.ts`, `.schema.ts`
- Controllers: finos — validam input, delegam ao service, mapeiam response
- Services: toda lógica de negócio, validação Zod, transações Prisma
- Repos: único ponto de acesso ao Prisma; transactions quando múltiplas entidades
- `packages/contracts`: source of truth dos schemas Zod (importado em api e web)
- Arquivos: máximo 400 linhas (CI bloqueia se exceder)
- Sem `console.log` em prod (CI bloqueia)
