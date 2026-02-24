# CHANGELOG 2026-02-24

## Tarefa 01 — Correção de bootstrap backend + estabilização da esteira do monorepo

### Objetivo
Corrigir erros que impediam a subida do backend no `pnpm run dev` e estabilizar a execução dos comandos obrigatórios (`lint`, `typecheck`, `test`, `build`) no monorepo.

### Arquivos alterados (principais)
- `apps/api/src/main.ts`
- `apps/api/tsconfig.json`
- `apps/api/jest.config.js`
- `apps/api/src/admin/events/admin-events.controller.ts`
- `apps/api/src/admin/events/admin-events.service.ts`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/app/admin/eventos/[id]/page.tsx`
- `apps/web/src/shared/hooks/use-events.ts`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `packages/contracts/src/index.spec.ts`
- `packages/utils/src/index.spec.ts`
- `turbo.json`
- `biome.json`
- `.context/docs/REPOMAP.md`

### O que mudou
- Corrigidos imports no bootstrap da API para remover erros de runtime e typecheck (`cookie-parser`, `express-session`, `passport`).
- Ajustada resolução de `@engaje/contracts` no `apps/api/tsconfig.json` para eliminar `TS6059` no modo watch/typecheck.
- Adicionados testes ausentes em `packages/contracts` e `packages/utils` para evitar quebra de suíte por ausência de arquivos de teste.
- Ajustadas configurações do monorepo/web para estabilidade de `dev/test/typecheck/build`:
  - `turbo dev` com dependência de `^build`.
  - `apps/web test` com `--pass-with-no-tests`.
  - `apps/web typecheck` garantindo arquivo de tipos em `.next/types`.
  - inclusão de `tailwindcss` em `apps/web` para build de produção.
- Corrigida página de login para atender requisito do Next (`useSearchParams` sob `Suspense`) em build.
- Refatorado acesso de export CSV no admin para não depender de acesso indevido a atributo privado do service.
- Atualizada configuração do Biome para NestJS/monorepo (parser de parameter decorators, ignorar `test-results`, desabilitar `useImportType` para preservar DI em runtime).

### Impacto
- Backend sobe normalmente em `pnpm run dev`.
- Suíte e build do workspace executam com sucesso.
- Pipeline local de qualidade volta a ser previsível para API/Web/packages.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 04 — Correção de pipeline Tailwind/PostCSS no app web

### Objetivo
Resolver a renderização sem estilos utilitários (layout "cru" com texto sem espaçamento/estrutura) nas páginas do frontend.

### Arquivos alterados (principais)
- `apps/web/postcss.config.mjs` (novo)
- `apps/web/package.json`
- `.context/docs/REPOMAP.md`

### O que mudou
- Identificada causa raiz: ausência de configuração PostCSS no `apps/web`, impedindo o processamento do `@import "tailwindcss"` em `globals.css`.
- Adicionado `postcss.config.mjs` com plugin oficial `@tailwindcss/postcss`.
- Adicionada dependência de build `@tailwindcss/postcss` no pacote `@engaje/web`.
- Atualizado `REPOMAP.md` para refletir o novo arquivo de configuração.

### Impacto
- Classes utilitárias do Tailwind voltam a ser compiladas e aplicadas.
- Páginas públicas/autenticadas recuperam estrutura visual (spacing, grid/flex, tipografia utilitária e responsividade).
- Sem alteração de contratos, API ou regras de negócio.

### Validação executada
- `pnpm --filter @engaje/web build` ✅

## Tarefa 02 — Restauro visual do frontend (tema, cores, layout e estados)

### Objetivo
Corrigir o frontend sem estilo (sem cores/efeitos) restaurando um stylesheet global completo e consistente para todas as telas públicas e autenticadas.

### Arquivos alterados (principais)
- `apps/web/src/app/globals.css`
- `apps/web/src/app/public/layout.tsx`

### O que mudou
- Reestruturado `globals.css` para cobrir todas as classes já usadas pelas páginas/componentes:
  - header/footer públicos, hero e cards de eventos,
  - formulários de login/registro/inscrição,
  - layouts autenticados, tabelas admin e paginação,
  - badges/status (`draft`, `published`, `closed`, `cancelled`, `confirmed`, `attended`, `no_show`),
  - estados visuais de erro/sucesso e botões (`primary`, `secondary`, `ghost`, `danger`).
- Adicionadas melhorias visuais e UX sem alterar regras de negócio:
  - tokens de cor, sombras, bordas e tipografia,
  - gradientes de fundo, hover/focus states, animação de entrada,
  - responsividade para mobile/tablet.
- Substituídos estilos inline do layout público por classes CSS (`public-layout`, `public-main`) para manter consistência do tema.

### Impacto
- Frontend volta a apresentar identidade visual completa em todas as rotas.
- Componentes passam a ter feedback visual claro (hover, foco, estado de erro/sucesso).
- Nenhuma alteração em contratos (`packages/contracts`), regras de API ou fluxo de autenticação.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 03 — Reformulação total do frontend público (portal municipal)

### Objetivo
Aplicar redesign completo do frontend público com linguagem institucional moderna e viva, mobile-first, componentes reutilizáveis, microinterações e melhorias de acessibilidade/performance.

### Arquivos alterados (principais)
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/public/layout.tsx`
- `apps/web/src/app/public/eventos/page.tsx`
- `apps/web/src/app/public/eventos/[slug]/page.tsx`
- `apps/web/src/app/public/programas/page.tsx` (novo)
- `apps/web/src/app/public/contato/page.tsx` (novo)
- `apps/web/src/components/public/public-header.tsx`
- `apps/web/src/components/public/public-footer.tsx`
- `apps/web/src/components/public/public-badge.tsx` (novo)
- `apps/web/src/components/public/event-card.tsx` (novo)
- `apps/web/src/components/registrations/quick-registration-form.tsx`
- `apps/web/src/lib/public-events.ts` (novo)
- `.context/docs/REPOMAP.md`

### O que mudou
- Criado novo design system leve via tokens em `globals.css` (cores semânticas, sombras, radius, tipografia e classes utilitárias de ação/estado).
- Atualizado layout raiz com fontes institucionais (`Sora` + `Nunito`) e reforço de metadados.
- Marcado layout autenticado (`/app/*`) com `robots: noindex` para aderência de SEO/segurança.
- Reescritas as telas públicas principais:
  - `/public/eventos`: hero institucional, filtros, chips de categorias, cards modernos, paginação clara e seção de iniciativas.
  - `/public/eventos/[slug]`: hero de detalhe, blocos de informação, galeria, sidebar de inscrição e CTA fixo no mobile.
- Criadas novas rotas públicas SEO-first:
  - `/public/programas` (programas/iniciativas),
  - `/public/contato` (canais institucionais + FAQ).
- Criados componentes reutilizáveis de UI pública (`PublicBadge`, `EventCard`) e utilitários de domínio para datas/categorias/vagas (`public-events.ts`).
- Melhorado fluxo de inscrição rápida com feedback visual de sucesso, melhor estado de erro e correção de redirect pós-cadastro usando `redirectPath`.
- Aplicadas animações sutis com respeito a `prefers-reduced-motion`.

### Impacto
- Portal público passa de layout básico para experiência institucional moderna, responsiva e com maior clareza de navegação.
- Melhora de escaneabilidade da agenda e da conversão de inscrição (CTA visível, estado de vagas e fluxo mais curto).
- Estrutura de frontend preparada para escala com componentes de domínio e rotas públicas adicionais.
- Sem alterações de contrato (`packages/contracts`) e sem quebra de API.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 05 — Nova Home publica com design system e microinteracoes

### Objetivo
Implementar a Home publica completa (`/public`) para o portal Engaje com identidade institucional da Prefeitura de Bandeirantes/MS, componentes reutilizaveis, dark mode e animacoes acessiveis.

### Arquivos alterados (principais)
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/public/page.tsx` (novo)
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/public/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/components/public/public-header.tsx`
- `apps/web/src/components/public/public-footer.tsx`
- `apps/web/src/components/public/public-badge.tsx`
- `apps/web/src/components/public/theme-toggle.tsx` (novo)
- `apps/web/src/components/public/home/*` (novo)
- `apps/web/src/components/ui/*` (novo)
- `apps/web/src/lib/cn.ts` (novo)
- `apps/web/package.json`
- `apps/web/src/components/public/home/home-utils.spec.ts` (novo)
- `.context/docs/PROJECT_STATE.md`
- `.context/docs/REPOMAP.md`

### O que mudou
- Criada rota publica `/public` como nova Home institucional; a raiz `/` agora redireciona para `/public`.
- Home modularizada por secoes com foco mobile-first:
  - hero com busca e CTAs,
  - categorias de iniciativas,
  - cards de eventos em destaque,
  - banner de campanha,
  - estatisticas com contador animado,
  - noticias,
  - bloco de engajamento com formulario demonstrativo, FAQ e timeline.
- Introduzido design system em `components/ui` com os componentes base solicitados:
  - `Button`, `Card`, `Badge`, `Input`, `Select`, `DatePicker`, `Modal`, `Toast`, `Skeleton`, `ProgressBar`, `Avatar`, `Chip`, `Accordion`, `Timeline`.
- Implementado dark mode institucional (`#0D1B2A`) com:
  - suporte automatico a `prefers-color-scheme`,
  - toggle manual persistido em `localStorage`.
- Header e footer publicos reescritos com identidade institucional, acessibilidade (skip link) e navegacao mobile com bottom tab bar.
- Incluida suite de testes Vitest no web para utilitarios da Home (`home-utils.spec.ts`).
- Sem alteracoes em contratos de API (`packages/contracts`) nesta tarefa.

### Impacto
- Portal publico passa a ter Home moderna, viva e orientada a participacao cidada.
- Base de componentes reutilizaveis preparada para evolucao das demais rotas publicas.
- Melhor previsibilidade de UX com feedback visual consistente em hover, loading, modal e toasts.

### Validacao executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 06 — Correção de CORS no login para acesso via IP de rede local

### Objetivo
Corrigir falha de preflight/CORS no `POST /v1/auth/login` quando o frontend roda fora de `localhost` (ex.: `http://192.168.1.21:3000`).

### Arquivos alterados (principais)
- `apps/api/src/config/app-origins.ts` (novo)
- `apps/api/src/config/app-origins.spec.ts` (novo)
- `apps/api/src/main.ts`
- `apps/api/src/auth/auth.controller.ts`
- `.env.example`
- `.context/docs/REPOMAP.md`

### O que mudou
- Criado módulo de configuração de origins do app (`app-origins.ts`) com:
  - suporte a `APP_URLS` (lista separada por vírgula),
  - fallback para `APP_URL`,
  - normalização e deduplicação de origins.
- CORS da API passou a usar validador por função (`origin` callback), com `credentials: true`.
- Em desenvolvimento (`NODE_ENV != production`), passou a aceitar origins locais comuns (`localhost`, `127.0.0.1` e IPs de rede privada), resolvendo fluxo de login em LAN sem abrir produção.
- Redirect do Google callback (`/v1/auth/google/callback`) passou a reutilizar o origin primário da mesma configuração, evitando divergência entre auth redirect e CORS.
- Documentada nova variável opcional `APP_URLS` em `.env.example`.

### Impacto
- Login via cookie (`credentials: include`) deixa de falhar por mismatch de origin quando o frontend está em IP local.
- Comportamento de produção permanece restritivo (somente origins configurados).
- Sem alterações de contratos em `packages/contracts` e sem mudança de rotas.

### Validacao executada
- `pnpm --filter @engaje/api lint` ✅
- `pnpm --filter @engaje/api typecheck` ✅
- `pnpm --filter @engaje/api exec jest --runInBand` ✅
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅
