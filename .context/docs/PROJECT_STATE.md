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
- Home institucional em `apps/web/src/app/public/page.tsx` com design system, microinteracoes, dark mode, bloco `Programa ativo` e painel `Engajamento da cidade` alimentados pela API publica.
- CTA `Inscrever-se` nos cards de eventos da Home direcionando para `/app/inscricoes/nova/[slug]` (com redirect para login quando sem sessao e retorno pos-login para a inscricao do evento).
- Agenda publica em `apps/web/src/app/public/eventos/*` com filtros, cards e paginacao.
- Detalhe de evento em `apps/web/src/app/public/eventos/[slug]/page.tsx` com:
  - renderizacao condicional por `registrationMode` (`registration` x `informative`),
  - CTA de inscricao direcionando para fluxo autenticado em `/app/inscricoes/nova/[slug]`,
  - CTA de presenca `Vou ir com certeza` com contador persistente.
- Paginas institucionais adicionais:
  - `apps/web/src/app/public/programas/page.tsx` (agora integrado com API publica)
  - `apps/web/src/app/public/programas/[slug]/page.tsx` (novo detalhe publico de programa)
  - `apps/web/src/app/public/contato/page.tsx`

### Web autenticada (SPA)
- Rotas em `apps/web/src/app/app/*` com `robots: noindex` e consumo client-side.
- Inscricao dinamica autenticada por slug em `/app/inscricoes/nova/[slug]` (renderiza campos configurados no admin e envia `formData` para `/v1/registrations`).
- Comprovante da inscricao em `/app/inscricoes/[id]` com protocolo, dados do evento e respostas preenchidas no formulario.
- Admin:
  - eventos em fluxo multi-etapas com builder dinamico (`/app/admin/eventos/[id]`),
  - gestao de programas (`/app/admin/programas` e `/app/admin/programas/[id]`).

### API (NestJS)
- Endpoints publicos `GET /v1/public/events*`, `GET /v1/public/programs*` e `GET /v1/public/platform-stats` (incluindo `GET /v1/public/programs/active` para o destaque da Home e painel de engajamento).
- Endpoints autenticados para auth, admin de eventos/programas, inscricoes e intencao de presenca.

## Rotas API Ativas

| Metodo | Endpoint | Descricao | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/public/events` | Lista publica de eventos com filtros/paginacao | Ativo |
| `GET` | `/v1/public/events/:slug` | Detalhe publico de evento | Ativo |
| `GET` | `/v1/public/programs` | Lista publica de programas com filtros/paginacao | Ativo |
| `GET` | `/v1/public/programs/active` | Programa atualmente ativo para o bloco da Home publica | Ativo |
| `GET` | `/v1/public/programs/:slug` | Detalhe publico de programa | Ativo |
| `GET` | `/v1/public/platform-stats` | Contadores publicos agregados da plataforma para a Home | Ativo |
| `POST` | `/v1/auth/login` | Login de usuario | Ativo |
| `POST` | `/v1/registrations` | Criacao de inscricao autenticada com `formData` dinamico | Ativo |
| `GET` | `/v1/registrations/:id` | Detalhe da inscricao autenticada com comprovante e respostas | Ativo |
| `POST` | `/v1/events/:id/attendance-intents` | Confirma intencao de presenca do usuario logado | Ativo |
| `DELETE` | `/v1/events/:id/attendance-intents` | Remove intencao de presenca do usuario logado | Ativo |
| `GET` | `/v1/events/:id/attendance-intents/me` | Estado de presenca do usuario + contador | Ativo |
| `GET` | `/v1/admin/events/:id` | Detalhe de evento para edicao no painel admin | Ativo |
| `POST` | `/v1/admin/programs` | Cria programa no painel admin | Ativo |
| `GET` | `/v1/admin/programs` | Lista programas no painel admin | Ativo |
| `GET` | `/v1/admin/programs/:id` | Detalhe de programa para edicao | Ativo |
| `PATCH` | `/v1/admin/programs/:id` | Atualiza programa no painel admin | Ativo |

## Rotas Web Publicas Ativas

| Rota | Descricao | Status |
| :--- | :--- | :--- |
| `/public` | Home institucional com busca, categorias, destaques e bloco `Programa ativo` | Ativo |
| `/public/eventos` | Agenda municipal com filtros e listagem de eventos | Ativo |
| `/public/eventos/[slug]` | Detalhe publico do evento + CTA para inscricao autenticada + CTA de presenca | Ativo |
| `/public/programas` | Listagem publica de programas via API | Ativo |
| `/public/programas/[slug]` | Detalhe publico de programa com modo inscricao/informativo | Ativo |
| `/public/contato` | Canais de contato e FAQ | Ativo |

## Estrutura do Banco de Dados
### PostgreSQL (unico)
- `users`, `events`, `registrations`, `programs`, `program_registrations` e `event_attendance_intents`.
- `events` e `programs` com `registration_mode`, `external_cta_*` e `dynamic_form_schema`.
- `programs` com flag `is_highlighted_on_home` para controlar o `Programa ativo` da Home (somente programas `published`).
- `registrations` com `form_data` (JSON) para respostas do builder dinamico.

## Pendencias e Roadmap Tecnico
### Concluido recentemente (2026-02-25)
- [x] Rodape publico atualizado com links oficiais de Facebook/Instagram e atalho do site institucional no conjunto de icones sociais.
- [x] Home publica: botao `Inscrever-se` dos cards agora navega para `/app/inscricoes/nova/[slug]` (sem popup), mantendo fluxo login -> redirect -> pagina de inscricao.
- [x] Home publica: CTA `Quero participar` do bloco `Programa ativo` deixou de abrir modal e agora navega para `/public/programas/[slug]`.
- [x] Usuário logado não exibe mais o botão `Inscrever-se` no menu público superior.
- [x] Header público agora reflete sessão autenticada (`Dashboard + Sair`) e logout no menu/dashboard redireciona para `/public`.
- [x] Contract-first completo para modo de inscricao (`registration`/`informative`) e form builder dinamico em eventos/programas.
- [x] Novos endpoints publicos de programas (`/v1/public/programs*`) e admin de programas (`/v1/admin/programs*`).
- [x] Fluxo de inscricao autenticada evoluido para persistir `formData` e validar obrigatorios dinamicos.
- [x] CTA de presenca com contador persistente e endpoints autenticados de attendance intent.
- [x] Admin SPA atualizado com gestao de programas + formularios multi-etapas com builder/preview.
- [x] Paginas publicas de programas migradas para API e novo detalhe `/public/programas/[slug]`.
- [x] Home publica redesenhada com design system reutilizavel e tema claro/escuro.
- [x] Suite de testes do web atualizada com Vitest para utilitarios da nova Home.
- [x] CORS de autenticacao ajustado para suportar origins em rede local no desenvolvimento (`APP_URLS` + fallback `APP_URL`).
- [x] Logging estruturado completo da API em desenvolvimento (nivel `debug` por padrao + logs HTTP com `request-id`).
- [x] Fluxo de login SPA corrigido para ambiente LAN (fallback dinamico de host da API + compatibilidade de redirect + rota `/app/dashboard`).
- [x] Correcao de roteamento admin no web (`/v1/v1/*`) e adicao do endpoint de detalhe `GET /v1/admin/events/:id`.
- [x] Fluxo de inscricao no detalhe publico alterado para CTA + redirecionamento para rota autenticada `/app/inscricoes/nova/[slug]` (middleware de login preservado).
- [x] Comprovante da inscricao para usuario autenticado em `/app/inscricoes/[id]` com endpoint dedicado `GET /v1/registrations/:id`.
- [x] Seletor de programa ativo na Home: admin agora define `isHighlightedOnHome` na criacao/edicao e pode alternar rapidamente na listagem.
- [x] Regra de negocio no backend para bloquear destaque de programas `closed/cancelled` e manter apenas 1 programa ativo na Home por vez.
- [x] Novo endpoint publico `GET /v1/public/programs/active` consumido pela Home para renderizar o bloco `Programa ativo` com dados reais.
- [x] Novo endpoint publico `GET /v1/public/platform-stats` consumido pela Home para renderizar `Engajamento da cidade` com dados reais e sem o indicador `Municipios parceiros`.
- [x] Home publica ajustada para buscar stats sem cache (`no-store`) e resolver origem da API com fallback `INTERNAL_API_URL` -> `NEXT_PUBLIC_API_URL` -> `localhost`, evitando `Inscricoes confirmadas` zerado por cache/origem incorreta.
- [x] Padronização do resolvedor de origem da API (`resolvePublicApiBase`) em todas as rotas públicas SSR de eventos/programas, mantendo cache SEO (`revalidate`) e eliminando divergência de origem entre páginas.

### Proximos passos sugeridos
- [ ] Expandir o design system para rotas `/public/eventos` e `/public/eventos/[slug]`.
- [ ] Criar testes E2E Playwright para fluxos da Home publica (busca e CTA de inscricao).
