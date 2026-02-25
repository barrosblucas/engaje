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
