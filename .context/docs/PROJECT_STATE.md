---
ai_update_goal: "Manter o estado atual do projeto, lista de funcionalidades e dividas tecnicas atualizadas."
required_inputs: ["git status", "file structure", "routes definition"]
success_criteria: "Refletir com precisao a estrutura do monorepo, dominios ativos e roadmap tecnico."
---

# PROJECT_STATE (Memoria Viva)

## Visao Geral
Este repositorio opera em **monorepo** com foco em arquitetura **contract-first**:
- `apps/` para aplicacoes deployaveis (API NestJS + Web Next.js).
- `packages/` para contratos e utilitarios compartilhados.
- `prisma/` para schema/migrations do Postgres.
- `.context/docs/` para documentacao viva (estado, mapa e changelog diario).

## Dominios Implementados

### Public Web (Next.js)
- Home institucional em `apps/web/src/app/public/page.tsx` com design system, microinteracoes e dark mode.
- Agenda publica em `apps/web/src/app/public/eventos/*` com filtros, cards e paginacao.
- Detalhe de evento em `apps/web/src/app/public/eventos/[slug]/page.tsx` com CTA de inscricao.
- Paginas institucionais adicionais:
  - `apps/web/src/app/public/programas/page.tsx`
  - `apps/web/src/app/public/contato/page.tsx`

### Web autenticada (SPA)
- Rotas em `apps/web/src/app/app/*` com `robots: noindex` e consumo client-side.

### API (NestJS)
- Endpoints publicos `GET /v1/public/events*`.
- Endpoints autenticados para auth, admin de eventos e inscricoes.

## Rotas API Ativas

| Metodo | Endpoint | Descricao | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/public/events` | Lista publica de eventos com filtros/paginacao | Ativo |
| `GET` | `/v1/public/events/:slug` | Detalhe publico de evento | Ativo |
| `POST` | `/v1/auth/login` | Login de usuario | Ativo |
| `POST` | `/v1/registrations` | Criacao de inscricao autenticada | Ativo |
| `GET` | `/v1/admin/events/:id` | Detalhe de evento para edicao no painel admin | Ativo |

## Rotas Web Publicas Ativas

| Rota | Descricao | Status |
| :--- | :--- | :--- |
| `/public` | Home institucional com busca, categorias, destaques e noticias | Ativo |
| `/public/eventos` | Agenda municipal com filtros e listagem de eventos | Ativo |
| `/public/eventos/[slug]` | Detalhe publico do evento + inscricao | Ativo |
| `/public/programas` | Programas e iniciativas municipais | Ativo |
| `/public/contato` | Canais de contato e FAQ | Ativo |

## Estrutura do Banco de Dados
### PostgreSQL (unico)
- `users`, `events`, `registrations` e tabelas relacionadas aos fluxos de autenticacao/admin/eventos.

## Pendencias e Roadmap Tecnico
### Concluido recentemente (2026-02-24)
- [x] Home publica redesenhada com design system reutilizavel e tema claro/escuro.
- [x] Suite de testes do web atualizada com Vitest para utilitarios da nova Home.
- [x] CORS de autenticacao ajustado para suportar origins em rede local no desenvolvimento (`APP_URLS` + fallback `APP_URL`).
- [x] Logging estruturado completo da API em desenvolvimento (nivel `debug` por padrao + logs HTTP com `request-id`).
- [x] Fluxo de login SPA corrigido para ambiente LAN (fallback dinamico de host da API + compatibilidade de redirect + rota `/app/dashboard`).
- [x] Correcao de roteamento admin no web (`/v1/v1/*`) e adicao do endpoint de detalhe `GET /v1/admin/events/:id`.

### Proximos passos sugeridos
- [ ] Expandir o design system para rotas `/public/eventos` e `/public/eventos/[slug]`.
- [ ] Criar testes E2E Playwright para fluxos da Home publica (busca e CTA de inscricao).
