# CHANGELOG 2026-02-25

## Tarefa 01 — Redimensionamento proporcional de imagem no editor de descrição

### Objetivo
Permitir redimensionar imagens inseridas no corpo da descrição clicando na imagem e arrastando o mouse, mantendo a proporção original.

### Arquivos alterados (principais)
- `apps/web/src/components/editor/rich-text-editor.tsx`
- `apps/api/src/shared/rich-text-sanitizer.ts`

### O que mudou
- Criada extensão de imagem no Tiptap com suporte a atributos `width` e `height`.
- Implementada interação de redimensionamento no editor por arraste do mouse sobre a imagem.
- O redimensionamento calcula a nova largura e aplica altura proporcional automaticamente.
- Ajustado o sanitize do backend para preservar `width` e `height` no HTML salvo.

### Impacto
- Imagens enviadas por upload na descrição agora podem ser redimensionadas visualmente no editor.
- Tamanho ajustado persiste após salvar e continua visível na página de visualização.

### Validação executada
- `pnpm --filter @engaje/web lint` ✅
- `pnpm --filter @engaje/web typecheck` ✅
- `pnpm --filter @engaje/api typecheck` ✅

## Tarefa 02 — Ocultar indicador de vagas em programas informativos

### Objetivo
Não exibir o indicador de vagas ("Vagas ilimitadas"/status de vagas) nas páginas públicas de programas quando o `registrationMode` for `informative`.

### Arquivos alterados (principais)
- `apps/web/src/lib/public-events.ts`
- `apps/web/src/app/public/programas/page.tsx`
- `apps/web/src/app/public/programas/[slug]/page.tsx`
- `apps/web/src/lib/public-events.spec.ts`

### O que mudou
- Adicionada função utilitária `shouldShowSlotsForMode` para centralizar a regra de visibilidade de vagas por modo.
- Atualizada a listagem pública de programas para não renderizar o bloco de vagas em cards informativos.
- Atualizado o detalhe público de programa para ocultar badge e texto de vagas quando o programa for informativo.
- Criados testes unitários cobrindo a regra para os modos `registration` e `informative`.

### Impacto
- Programas informativos deixam de exibir informação de vagas, reduzindo ruído visual e alinhando o conteúdo ao tipo de programa.
- Programas com modo de inscrição continuam exibindo a disponibilidade normalmente.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 12 — Ajuste de bind do Next.js dev para acesso LAN

### Objetivo
Evitar falhas intermitentes de acesso por IP local (`192.168.x.x`) durante desenvolvimento, garantindo bind explicito em todas as interfaces.

### Arquivos alterados (principais)
- `apps/web/package.json`
- `.context/docs/changelog/CHANGELOG_2026_02_25.md`

### O que mudou
- Script `dev` do web alterado de `next dev -p 3000` para `next dev -H 0.0.0.0 -p 3000`.

### Impacto
- O servidor Next.js em desenvolvimento passa a escutar explicitamente em rede local, reduzindo risco de `ERR_CONNECTION_REFUSED` ao acessar via IP da maquina.

### Validação executada
- Verificado bind ativo em `*:3000`.
- `HEAD /public` em `http://localhost:3000/public` e `http://192.168.1.21:3000/public` retornando `200`.
- `HEAD /app/inscricoes/nova/[slug]` retornando `307` para `/login?redirect=...` (fluxo esperado sem sessao).

## Tarefa 13 — Mitigação de instabilidade por pressão de memória no ambiente dev

### Objetivo
Reduzir quedas intermitentes dos servidores de desenvolvimento (`ERR_CONNECTION_REFUSED`) causadas por pressão de memória e OOM no host durante recompilações.

### Arquivos alterados (principais)
- `apps/web/package.json`
- `apps/api/package.json`
- `.context/docs/changelog/CHANGELOG_2026_02_25.md`

### O que mudou
- `@engaje/web`:
  - `dev` passou a executar com `NODE_OPTIONS='--max-old-space-size=1536 --dns-result-order=ipv4first'`.
- `@engaje/api`:
  - `dev` passou a executar com `NODE_OPTIONS='--max-old-space-size=1024 --dns-result-order=ipv4first'`.

### Impacto
- Diminui o consumo máximo de heap por processo Node no modo desenvolvimento.
- Reduz probabilidade de o kernel encerrar processos de dev por OOM em máquinas com pouca memória/swap.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 14 — Limpeza de artefato de upload local e proteção no git

### Objetivo
Remover arquivo de upload gerado localmente do working tree e impedir que novos uploads locais do backend sejam versionados por engano.

### Arquivos alterados (principais)
- `.gitignore`
- `.context/docs/changelog/CHANGELOG_2026_02_25.md`

### O que mudou
- Removido do workspace o artefato local `apps/api/uploads/content/1771990333976-ne1apc2o3c.webp`.
- Adicionada regra `apps/api/uploads/` no `.gitignore`.

### Impacto
- Uploads gerados em desenvolvimento deixam de “sujar” o `git status`.
- Sem impacto funcional em rotas, contratos, API ou frontend.

## Tarefa 08 — Padronização de origem da API nas rotas públicas SSR

### Objetivo
Aplicar o mesmo resolvedor de origem da API pública em todas as páginas SSR de eventos/programas para manter consistência entre rotas.

### Arquivos alterados (principais)
- `apps/web/src/app/public/eventos/page.tsx`
- `apps/web/src/app/public/eventos/[slug]/page.tsx`
- `apps/web/src/app/public/programas/page.tsx`
- `apps/web/src/app/public/programas/[slug]/page.tsx`
- `.context/docs/PROJECT_STATE.md`

### O que mudou
- Substituído fallback local direto (`process.env.INTERNAL_API_URL ?? localhost`) pelo utilitário `resolvePublicApiBase()` nas quatro páginas públicas SSR acima.
- Mantida a estratégia de cache existente (`revalidate: 60`) nessas páginas para preservar comportamento SEO-first.

### Impacto
- Evita que páginas públicas diferentes consultem origens distintas da API em ambientes LAN/container.
- Reduz chance de inconsistência de dados entre Home, lista e detalhe públicos.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 07 — Correção de `Inscricoes confirmadas` zerado na Home

### Objetivo
Garantir que o card `Inscricoes confirmadas` da Home pública reflita o valor real do banco mesmo em cenários de cache e/ou ambiente LAN/container.

### Arquivos alterados (principais)
- `apps/web/src/app/public/page.tsx`
- `apps/web/src/lib/public-api-base.ts`
- `apps/web/src/lib/public-api-base.spec.ts`
- `.context/docs/PROJECT_STATE.md`
- `.context/docs/REPOMAP.md`

### O que mudou
- Home pública passou a resolver origem da API com prioridade:
  - `INTERNAL_API_URL`
  - `NEXT_PUBLIC_API_URL`
  - fallback `http://localhost:3001`
- Fetch de `GET /v1/public/platform-stats` foi alterado para `cache: 'no-store'`, evitando valor antigo de inscrições em cache.
- Adicionado teste unitário para o resolver de origem da API pública, cobrindo prioridade e fallbacks.

### Impacto
- Reduz risco de `Inscricoes confirmadas: 0` quando há inscrições no banco, especialmente em ambientes onde `localhost` não é a origem correta da API para SSR.
- Painel de engajamento passa a refletir o dado atual de forma mais confiável.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 03 — Seleção de “Programa ativo” na Home com trava de status

### Objetivo
Permitir marcar, na criação/edição de programas, qual deve aparecer no bloco `Programa ativo` da Home, com alternância entre programas publicados e bloqueio para programas encerrados/cancelados.

### Arquivos alterados (principais)
- `prisma/schema.prisma`
- `prisma/migrations/20260225113000_add_program_home_highlight/migration.sql`
- `packages/contracts/src/index.ts`
- `packages/contracts/src/index.spec.ts`
- `apps/api/src/admin/programs/admin-programs.service.ts`
- `apps/api/src/public/programs/public-programs.controller.ts`
- `apps/api/src/public/programs/public-programs.service.ts`
- `apps/api/src/super-admin-plan.spec.ts`
- `apps/web/src/app/app/admin/programas/[id]/page.tsx`
- `apps/web/src/app/app/admin/programas/page.tsx`
- `apps/web/src/app/public/page.tsx`
- `apps/web/src/components/public/home/home-page.tsx`
- `apps/web/src/components/public/home/home-highlight-banner.tsx`
- `apps/web/src/shared/hooks/use-admin.ts`
- `.context/docs/PROJECT_STATE.md`
- `.context/docs/REPOMAP.md`

### O que mudou
- Criado campo persistente `programs.is_highlighted_on_home` (migration + indice).
- Contratos atualizados com `isHighlightedOnHome` em payloads/retornos de programas e novo schema `PublicActiveProgramResponseSchema`.
- Backend admin de programas:
  - valida que destaque de Home só pode ser aplicado em programa `published`,
  - impede seleção de destaque para `closed/cancelled`,
  - aplica transação para manter apenas um programa ativo na Home por vez.
- Novo endpoint público `GET /v1/public/programs/active` para entregar o programa ativo da Home.
- Home pública passou a consumir endpoint real do programa ativo no banner.
- Admin de programas ganhou:
  - checkbox no formulário de criação/edição para “Programa ativo na página inicial”,
  - ação rápida na listagem para alternar o programa ativo.
- Testes de contrato e integração foram atualizados para cobrir destaque de Home e alternância entre programas.

### Impacto
- O bloco `Programa ativo` da Home deixa de ser estático e passa a refletir configuração real do painel admin.
- A regra de negócio evita exibir programa encerrado/cancelado como ativo.
- A troca de programa ativo ficou operacional no fluxo de gestão sem necessidade de intervenção manual no banco.

### Validação executada
- `pnpm db:generate` ✅
- `pnpm db:migrate` ✅
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 04 — Remoção da seção de notícias da Home pública

### Objetivo
Remover completamente o bloco `Ultimas noticias` da Home pública, incluindo o conteúdo estático e a composição da seção no frontend.

### Arquivos alterados (principais)
- `apps/web/src/components/public/home/home-page.tsx`
- `apps/web/src/components/public/home/home-data.ts`
- `apps/web/src/components/public/home/home-news.tsx` (removido)
- `apps/web/src/components/public/public-header.tsx`
- `.context/docs/PROJECT_STATE.md`
- `.context/docs/REPOMAP.md`

### O que mudou
- Removido o `HomeNews` da composição da Home pública (`HomePage`).
- Excluído o componente `home-news.tsx`.
- Removidos `HOME_NEWS` e tipos relacionados do `home-data.ts`.
- Removido o item `Noticias` da navegação rápida mobile para evitar link quebrado para `#noticias`.
- Atualizada a documentação viva para refletir que a Home pública não possui mais o bloco de notícias.

### Impacto
- A Home pública deixa de renderizar a seção com `Ultimas noticias`, cards de notícias e CTA `Todas as noticias`.
- Sem impacto em contratos (`packages/contracts`) e sem alterações de API.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 05 — Correção de fuso horário no detalhe público de eventos

### Objetivo
Corrigir a exibição de horário em páginas públicas de eventos para evitar deslocamento quando o servidor estiver em UTC, mantendo o horário municipal correto (America/Campo_Grande).

### Arquivos alterados (principais)
- `apps/web/src/lib/public-events.ts`
- `apps/web/src/lib/public-events.spec.ts`
- `.context/docs/REPOMAP.md`

### O que mudou
- Fixado timezone explícito `America/Campo_Grande` nos formatadores de data/hora do domínio público.
- Ajustada a regra de mesmo dia (`sameDay`) para comparar datas no timezone municipal, sem depender do timezone do runtime.
- Ajustado o cálculo de `Hoje`/`Amanhã` para usar o mesmo timezone municipal.
- Adicionados testes de regressão cobrindo:
  - evento `2026-03-08T11:00:00.000Z` exibindo `07:00` até `11:00`,
  - label relativa correta em borda de dia para UTC-4.

### Impacto
- Eventos cadastrados em horário local deixam de aparecer com +4h na rota pública de detalhe/listagem quando o servidor roda em UTC.
- A consistência de data/hora passa a ser estável entre SSR e client.

### Validação executada
- `pnpm --filter @engaje/web test -- src/lib/public-events.spec.ts` ✅
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 06 — Painel de engajamento da Home com dados reais

### Objetivo
Substituir os indicadores mockados do bloco `Engajamento da cidade` por dados reais da plataforma e remover o indicador `Municipios parceiros`.

### Arquivos alterados (principais)
- `packages/contracts/src/index.ts`
- `packages/contracts/src/index.spec.ts`
- `apps/api/src/public/public.module.ts`
- `apps/api/src/public/platform-stats/public-platform-stats.controller.ts`
- `apps/api/src/public/platform-stats/public-platform-stats.service.ts`
- `apps/api/src/public/platform-stats/public-platform-stats.spec.ts`
- `apps/web/src/app/public/page.tsx`
- `apps/web/src/components/public/home/home-types.ts`
- `apps/web/src/components/public/home/home-stats.tsx`
- `apps/web/src/components/public/home/home-utils.ts`
- `apps/web/src/components/public/home/home-utils.spec.ts`
- `apps/web/src/components/public/public-header.tsx`
- `.context/docs/PROJECT_STATE.md`
- `.context/docs/REPOMAP.md`

### O que mudou
- Contrato novo `PublicPlatformStatsResponseSchema` em `@engaje/contracts` para padronizar as metricas publicas da Home.
- Novo endpoint publico `GET /v1/public/platform-stats` no backend com agregacao real de:
  - eventos publicados,
  - inscricoes confirmadas (eventos + programas),
  - programas publicados (exibidos como `Programas ativos`).
- Teste de integracao adicionado para garantir que o endpoint reflete incrementos reais no banco.
- Home publica passou a consumir `GET /v1/public/platform-stats` com `revalidate` e fallback seguro.
- Card `Municipios parceiros` removido do painel `Engajamento da cidade` (mantendo 3 indicadores reais).
- Remocao da funcao de mock `buildHomeStats` e ajuste dos testes de utilitarios da Home.
- Ajuste de formatacao em `public-header.tsx` para manter `pnpm lint` verde (sem impacto funcional).

### Impacto
- O painel de engajamento deixa de exibir valores simulados e passa a refletir dados reais da plataforma.
- Reducao de ruído no bloco de indicadores ao remover a metrica sem fonte oficial (`Municipios parceiros`).

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 09 — Menu público sensível a sessão + logout com redirecionamento

### Objetivo
Garantir que o menu reflita o estado autenticado após login (exibindo `Dashboard` e `Sair`) e que o logout no menu/dashboard redirecione para a Home pública (`/public`).

### Arquivos alterados (principais)
- `apps/web/src/components/public/public-header.tsx`
- `apps/web/src/components/public/public-header-auth.ts` (novo)
- `apps/web/src/components/public/public-header-auth.spec.ts` (novo)
- `apps/web/src/app/app/inscricoes/page.tsx`
- `apps/web/src/app/app/admin/eventos/page.tsx`
- `apps/web/src/app/app/admin/programas/page.tsx`
- `.context/docs/REPOMAP.md`

### O que mudou
- Header público passou a consultar sessão (`useMe`) e alternar ações:
  - sem sessão: mantém `Entrar`,
  - com sessão: exibe `Dashboard` (por papel) e `Sair`.
- Implementado logout no header público com redirect explícito para `/public` após sucesso.
- Atualizado menu mobile (painel e bottom nav) para refletir estado logado e acesso ao dashboard.
- Ajustados botões `Sair` nas telas autenticadas (`inscricoes`, `admin/eventos`, `admin/programas`) para redirecionar para `/public` após logout.
- Criada camada pura de regras (`public-header-auth.ts`) com testes unitários cobrindo:
  - estado anônimo,
  - dashboard por papel (`citizen`, `admin`, `super_admin`),
  - destino padrão pós-logout.

### Impacto
- Usuário autenticado passa a ver ações corretas no menu público sem ficar preso ao estado visual de visitante.
- Logout fica consistente entre header público e menus da área autenticada, sempre retornando para a Home pública.
- Sem alteração de contratos (`packages/contracts`) e sem mudança de endpoint backend.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 10 — Ocultar botão `Inscrever-se` para usuário logado

### Objetivo
Remover o CTA `Inscrever-se` do menu quando houver sessão autenticada ativa.

### Arquivos alterados (principais)
- `apps/web/src/components/public/public-header.tsx`
- `apps/web/src/components/public/public-header-auth.ts`
- `apps/web/src/components/public/public-header-auth.spec.ts`

### O que mudou
- Incluída na regra de estado do header a flag `showEnrollmentButton`.
- Estado anônimo mantém `showEnrollmentButton: true`.
- Estado autenticado define `showEnrollmentButton: false`.
- O botão `Inscrever-se` no desktop agora renderiza apenas quando `showEnrollmentButton` for `true`.
- Testes unitários atualizados para validar a regra em usuário anônimo e logado.

### Impacto
- Usuário autenticado não vê mais o botão `Inscrever-se` no menu superior.
- Usuário não autenticado mantém o CTA normalmente.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅

## Tarefa 11 — Fluxo de inscrição da Home pública sem popup

### Objetivo
Corrigir o comportamento do CTA `Inscrever-se` da Home publica para navegar ao fluxo real de inscricao por evento, em vez de abrir feedback simulado/popup.

### Arquivos alterados (principais)
- `apps/web/src/components/public/home/home-featured-events.tsx`
- `apps/web/src/components/public/home/home-highlight-banner.tsx`
- `apps/web/src/components/public/home/home-page.tsx`
- `apps/web/src/components/public/home/home-engagement.tsx`
- `apps/web/src/components/public/home/home-utils.ts`
- `apps/web/src/components/public/home/home-utils.spec.ts`
- `.context/docs/PROJECT_STATE.md`
- `.context/docs/REPOMAP.md`
- `.context/docs/changelog/CHANGELOG_2026_02_25.md`

### O que mudou
- O botao `Inscrever-se` dos cards de eventos na Home passou a usar link direto para `/app/inscricoes/nova/[slug]`.
- Mantido o fluxo de autenticacao existente:
  - usuario logado segue direto para a pagina de inscricao;
  - usuario sem sessao e redirecionado para `/login?redirect=/app/inscricoes/nova/[slug]`;
  - apos login, retorna para a inscricao do evento.
- O CTA `Quero participar` do bloco `Programa ativo` deixou de abrir modal e passou a navegar para `/public/programas/[slug]` (fallback `/public/programas`).
- Removido o fluxo de modal de inscricao simulada da secao `HomeEngagement`.
- Criados helpers puros de rota em `home-utils` com testes unitarios dedicados.

### Impacto
- Elimina friccao de UX na Home publica ao trocar simulacao por navegacao real de inscricao.
- Garante consistencia entre CTA de Home e fluxo oficial autenticado de inscricoes.
- Sem alteracoes de contrato (`packages/contracts`) e sem mudancas de endpoint backend.

### Validação executada
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅
- `pnpm build` ✅
