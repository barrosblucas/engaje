```markdown
<!-- agent-update:start:architecture-notes -->
# Architecture Notes

## Visão Geral (contract-first, AI-native/LLM Friendly)

## Monorepo (pnpm + Turborepo) — Engaje (Contract-first, AI-Native / LLM Friendly)
- Monorepo com **pnpm workspaces** + **Turborepo**.
- Objetivo: **AI-Coded / AI-Native / LLM-Friendly**
  - Estrutura determinística, baixa “magia”, módulos pequenos.
  - SSOT de contratos em `packages/contracts` (Zod).
  - Um único caminho de fetching no Web via `shared/api-client.ts` + **TanStack Query**.
  - Governança automatizada via `scripts/` e tasks do Turbo.
  - Documentação viva em `.context/docs`, com `REPOMAP.md` obrigatório.


### Estrutura
- **apps/api**: NestJS (prefixo global `v1`)
  - expõe `GET /v1/public/*` (read-only + rate limit)
  - expõe `/v1/*` (autenticado)
- **apps/web**: **Next.js 15 (App Router) + TailwindCSS v4 + shadcn/ui**
  - rotas públicas em `app/public/*`
  - rotas autenticadas em `app/app/*`
- **packages/contracts**: Zod SSOT (tipos via `z.infer`)
- **packages/utils**: helpers puros (sem IO)
- **prisma/**: schema + migrações Postgres (banco único)
- **scripts/**: checks de governança (prisma-migration, no-console)
- **.context/docs**: wiki viva; `REPOMAP.md` (mapa estrutural); changelog diário obrigatório

## Componentes principais
- **Apps**: Artefatos deployáveis (API, Web).
- **Contracts**: Entrada/saída padrão para todos os domínios.
- **Data Layer**: Prisma isolado em repos.
- **Docs**: `.context/docs` e `REPOMAP.md` mantêm o mapa vivo.

## Regras e Padrões
- Funções pequenas; limite soft 250 linhas, hard 400 (governança).
- Controller fino; regra no service; IO apenas no repo.
- TanStack Query para dados no front; sem fetch direto em componentes.
- Contract-first: atualizar `packages/contracts` antes de API/Web.
- Toda mudança estrutural ou de rota exige atualização de `REPOMAP.md` e registro no changelog diário.
- JSONB para campos variáveis (scenarios, metadados); colunas normais para filtros frequentes.

## Integrações e Dependências
- **REST**: `/v1/*` prefixo global. Documentar novos endpoints com exemplos alinhados aos contratos.
- **Banco**: PostgreSQL único via Prisma; JSONB para dados flexíveis; migrations obrigatórias.
- **LLM**: Nenhum integrado; adicionar via adapter se necessário.

## Decisões e Trade-offs (Stack Next.js)
- **Contract-first (SSOT em `packages/contracts`)** reduz drift entre front/back, mas aumenta o trabalho inicial de modelagem e versionamento de schema (Zod + inferência de tipos).
- **NestJS + Prisma (Postgres)** melhora DX e mantém tipos fortes ponta-a-ponta, mas exige disciplina em:
  - transações (`$transaction`) quando há múltiplas escritas,
  - consistência de `include/select` para evitar N+1,
  - migrações obrigatórias para qualquer mudança no `schema.prisma`.
- **Next.js 15 (App Router) + TanStack Query** equilibra SEO e segurança via separação rígida:
  - **`app/public/*` (SEO-first)**: permite **SSR/SSG/ISR** *somente* para conteúdo público via `GET /v1/public/*` (read-only + rate limit).
  - **`app/app/*` (autenticado, SPA)**: **proibido SSR/SSG/ISR**; todo dado autenticado é **client-side** via TanStack Query + `shared/api-client.ts` com `credentials: "include"`.
  - Trade-off: melhor indexação e performance percebida no público; maior responsabilidade de UX/loading/estado no autenticado (SPA).
- **Auth via cookie httpOnly (session)** aumenta segurança (menos exposição de token no client), mas requer:
  - `credentials: "include"` em todas as chamadas autenticadas,
  - middleware protegendo `/app/*`,
  - cuidado para **nunca** renderizar no server dados dependentes de sessão/cookie.
- **SEO e indexação controlada** reduz risco de vazamento/acesso indevido:
  - `/app/*` deve ser **noindex** (e opcionalmente `robots` disallow),
  - conteúdo indexável fica restrito a `app/public/*`.

- **Biome** unifica lint/format e acelera CI, mas pode exigir ajustes de regras/auto-fix e alinhamento do time com as convenções (especialmente ao migrar de ESLint/Prettier).

## Riscos & Constraints
- **Doc drift**: Manter REPOMAP e changelog em sincronia a cada mudança.
- **Prefixo**: `/v1` obrigatório nas rotas.
- **Schema**: Qualquer alteração requer migration + contrato + testes.
- **Tamanho**: Refatorar antes de ultrapassar 250/400 linhas.
- **JSONB queries**: Evitar queries complexas; preferir colunas derivadas se necessário.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Confirmar fluxos (controller/service/repo) com o código atual.
2. Validar diagramas e rotas com `apps/api` e `apps/web`.
3. Garantir que contratos e REPOMAP refletem novos domínios antes de merge.
4. Registrar mudanças no changelog diário.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Árvore do repositório, contratos em `packages/contracts`, schema Prisma, configs de CI.
- PRs/ADRs aprovados sobre arquitetura.

## Related Resources
- [Project Overview](./project-overview.md)
- [AI-GOVERNANCE](./AI-GOVERNANCE.md)

<!-- agent-update:end -->
```
