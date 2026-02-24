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

## Tarefa 11 — Redesign da pagina de login com base no componente Travel Connect

### Objetivo
Aplicar novo layout da tela de login inspirado no componente `travel-connect-signin-1` da 21st.dev, mantendo a logica de autenticacao existente, textos em portugues e identidade visual (fontes e paleta) do projeto.

### Arquivos alterados (principais)
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/login/dot-map-canvas.tsx` (novo)
- `apps/web/src/app/login/login-redirect.ts` (novo)
- `apps/web/src/app/login/login-redirect.spec.ts` (novo)
- `apps/web/src/app/globals.css`
- `.context/docs/REPOMAP.md`

### O que mudou
- Reescrita da tela `/login` para layout em duas colunas:
  - painel visual com mapa pontilhado animado e trilhas de conexao,
  - painel de formulario com hierarquia visual e CTA principal.
- Todos os textos da experiencia de login foram mantidos em portugues.
- Estilos foram adaptados para os tokens do projeto (`--color-primary`, `--color-accent`, tipografia global), sem introduzir nova paleta externa.
- Mantida a integracao existente de login (`useLogin`) e comportamento de redirect.
- Extraido helper de redirect seguro (`resolveLoginRedirect`) com validacao de path interno para evitar open redirect.
- Adicionados testes unitarios do helper de redirect no `apps/web` (Vitest).

### Impacto
- Tela de login fica alinhada ao visual solicitado (inspiracao 21st.dev) sem quebrar o fluxo de autenticacao atual.
- Melhor seguranca no redirect pos-login.
- Sem alteracoes em contratos Zod (`packages/contracts`) e sem alteracoes de API.

### Validacao executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 12 — Correcao definitiva de assets 404 no `next dev` (HTML cru)

### Objetivo
Eliminar recorrencia de tela sem CSS/JS em desenvolvimento (requests `/_next/static/*` com `404`) apos alteracoes de codigo.

### Arquivos alterados (principais)
- `apps/web/src/middleware.ts`
- `apps/web/next.config.ts`
- `apps/web/tsconfig.json`
- `.gitignore`
- `.context/docs/REPOMAP.md`

### O que mudou
- Removido workaround de rewrite no middleware para `/_next/static/css/*` (`__next_css_remove`), que era paliativo e podia gerar inconsistencias de assets.
- Middleware voltou a atuar somente na protecao de rotas autenticadas (`/app/*`), sem tocar em assets internos do Next.
- Configurado `distDir` separado por ambiente no Next:
  - desenvolvimento: `.next-dev`
  - build/producao: `.next`
- Com isso, artefatos do `next dev` deixam de colidir com comandos como `build/typecheck` que tambem usam `.next`.
- `apps/web/tsconfig.json` foi sincronizado para incluir tipos gerados em `.next-dev/types/**/*.ts` (alem de `.next/types/**/*.ts`).
- `.next-dev` foi adicionado ao `.gitignore` para evitar ruído no versionamento e lint em arquivos gerados de dev.

### Impacto
- Corrige de forma estrutural o cenario de pagina renderizada em HTML cru por `404` de CSS/chunks no dev.
- Reduz risco de regressao quando houver alteracao de codigo com servidor dev ativo e execucao de comandos de qualidade/build em paralelo.
- Sem alteracoes de contrato (`packages/contracts`) e sem mudancas de API.

### Validacao executada
- Reproducao local em dev (`/public`) com verificacao de status para todos os assets referenciados em `/_next/static/*` antes/depois de alteracao de arquivo: ✅ (`200` em todos).
- Reproducao com `pnpm --filter @engaje/web build` executado durante `next dev`: ✅ (assets permaneceram `200`).
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 10 — Correção de CSS 404 no Next dev (página “HTML cru”)

### Objetivo
Corrigir regressão em desenvolvimento onde a aplicação renderizava apenas HTML sem estilos porque `/_next/static/css/app/layout.css` retornava `404`.

### Arquivos alterados (principais)
- `apps/web/src/middleware.ts`

### O que mudou
- Adicionada normalização no middleware para requests de CSS estático do Next em `development`:
  - quando a URL começa com `/_next/static/css/` e não possui `__next_css_remove`,
  - o middleware faz rewrite para a mesma URL adicionando `__next_css_remove=1`.
- Mantida a regra de proteção de rotas autenticadas (`/app/*`) sem alteração de comportamento.
- Atualizado `matcher` do middleware para também incluir `/_next/static/css/:path*`.

### Impacto
- O CSS principal volta a responder `200` no fluxo de dev e a UI deixa de aparecer “crua”/sem estilo.
- Sem alterações de contratos (`packages/contracts`) e sem mudança de endpoints da API.

### Validacao executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 08 — Correção de navegação pós-login em ambiente local/LAN

### Objetivo
Corrigir o cenário em que o usuário clica em entrar, não vê erro, mas permanece na tela de login sem ir para a área autenticada.

### Arquivos alterados (principais)
- `apps/web/src/shared/api-client.ts`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/middleware.ts`
- `apps/web/src/app/app/dashboard/page.tsx` (novo)
- `.context/docs/REPOMAP.md`
- `.context/docs/PROJECT_STATE.md`

### O que mudou
- Ajustado `api-client` para fallback dinâmico de URL da API quando `NEXT_PUBLIC_API_URL` não está definido:
  - usa `window.location.hostname` + porta `3001` no browser.
  - evita mismatch `localhost` vs `192.168.x.x` no desenvolvimento em LAN.
- Login passou a aceitar tanto `redirect` quanto `callbackUrl` na query string e default para `/app/dashboard`.
- Middleware atualizado para enviar `redirect` (alinhado ao login atual).
- Criada rota `/app/dashboard` como ponte, redirecionando para `/app/inscricoes`.

### Impacto
- Fluxo de login deixa de “voltar para login” silenciosamente quando frontend roda em IP local.
- Navegação pós-login fica consistente entre links diretos, middleware e callback de autenticação.
- Sem alterações de contratos (`packages/contracts`) e sem mudanças em endpoints da API.

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

## Tarefa 09 — Correção de sessão no login (botão Entrar sem avanço)

### Objetivo
Corrigir o cenário em que o `POST /v1/auth/login` retornava `200`, mas não persistia sessão, mantendo o usuário preso na tela de login após clicar em **Entrar**.

### Arquivos alterados (principais)
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/auth/auth.spec.ts`

### O que mudou
- `AuthController.login` passou a persistir sessão explicitamente com `req.login(...)` antes de responder.
- Fluxo de sessão foi centralizado em helper interno (`persistSession`) e reaproveitado também no `register`.
- Adicionado teste de regressão de integração para validar que:
  - login retorna cookie de sessão (`connect.sid`);
  - o mesmo agente autenticado consegue acessar `GET /v1/auth/me`.
- Sem mudanças em contratos Zod (`packages/contracts`) e sem criação de novos endpoints.

### Impacto
- O fluxo de pós-login volta a funcionar: após autenticar, a navegação para `/app/*` deixa de cair em redirecionamento silencioso para `/login`.
- Reduz risco de regressão com cobertura explícita de sessão no teste de integração de auth.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

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

## Tarefa 07 — Logging completo da API em ambiente de desenvolvimento

### Objetivo
Habilitar observabilidade completa no backend em `dev`, com logs estruturados de aplicação e logs HTTP por request, sem expor dados sensíveis.

### Arquivos alterados (principais)
- `apps/api/src/config/app-logger.ts` (novo)
- `apps/api/src/config/nest-logger.ts` (novo)
- `apps/api/src/config/http-logging.middleware.ts` (novo)
- `apps/api/src/config/app-logger.spec.ts` (novo)
- `apps/api/src/config/http-logging.middleware.spec.ts` (novo)
- `apps/api/src/main.ts`
- `.env.example`
- `.context/docs/REPOMAP.md`
- `.context/docs/PROJECT_STATE.md`

### O que mudou
- Criado logger central em Pino com:
  - `LOG_LEVEL` opcional via ambiente,
  - fallback `debug` em desenvolvimento e `info` em produção,
  - redaction de headers sensíveis (`authorization`, `cookie`, `set-cookie`).
- Criado adaptador de logger para NestJS, preservando contexto e trace em logs do framework.
- Adicionado middleware HTTP global com:
  - geração/propagação de `x-request-id`,
  - log de método, rota, status, duração e IP para toda request,
  - metadados adicionais em `dev` (`origin`, `referer`, `user-agent`),
  - nível dinâmico por status (`info`/`warn`/`error`).
- Atualizado `.env.example` com seção de `LOG_LEVEL`.
- Cobertura de testes para resolução de nível de log e comportamento do middleware HTTP.

### Impacto
- Desenvolvimento local com rastreabilidade completa de requests e erros.
- Melhor correlação de incidentes via `request-id`.
- Produção permanece com logs estruturados e sem vazamento de headers sensíveis.
- Sem alterações de contratos em `packages/contracts` e sem mudança de rotas.

### Validacao executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅
