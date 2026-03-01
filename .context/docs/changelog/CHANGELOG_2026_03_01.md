# CHANGELOG 2026-03-01

## Tarefa 01 — Duas versões de exportação PDF nas inscrições do admin

### Objetivo
Adicionar uma opção de exportação PDF sem as respostas preenchidas no formulário de inscrição, mantendo também a versão já existente com respostas.

### Arquivos alterados
- `apps/web/src/app/app/admin/eventos/[id]/inscricoes/page.tsx`
- `apps/web/src/shared/hooks/use-admin.ts`
- `apps/web/src/lib/admin-registrations-pdf.ts`
- `apps/web/src/lib/admin-registrations-pdf.spec.ts`
- `.context/docs/REPOMAP.md`
- `.context/docs/PROJECT_STATE.md`

### O que mudou
- Tela admin de inscrições passou a exibir dois botões de exportação:
  - `Gerar PDF (com respostas)`
  - `Gerar PDF (sem respostas)`
- Fluxo de geração de PDF passou a aceitar variante:
  - `with_answers` (comportamento atual)
  - `without_answers` (oculta respostas do formulário)
- Nome do arquivo PDF foi diferenciado para versão sem respostas com sufixo `-sem-respostas`.
- Teste unitário atualizado para cobrir o nome de arquivo da nova variante.

### Impacto
- Operação administrativa ganha exportação segura para compartilhamento sem expor dados preenchidos no ato da inscrição.
- Fluxo existente de exportação completa permanece disponível e compatível.
