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
