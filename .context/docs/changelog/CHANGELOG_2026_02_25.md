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
