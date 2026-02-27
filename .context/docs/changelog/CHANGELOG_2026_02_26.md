# CHANGELOG 2026-02-26

## Tarefa 01 — Robustez do start-production.sh fora do VS Code SSH

### Objetivo
Evitar falhas de ambiente ao executar `bash start-production.sh` em terminais que nao carregam automaticamente gerenciadores de runtime (nvm/asdf/volta/fnm) e PATH completo.

### Arquivos alterados
- `start-production.sh`

### O que mudou
- Script agora usa `set -euo pipefail` (falha rapida e previsivel).
- Carrega bootstrap de ambiente quando disponivel:
  - `~/.bashrc`
  - `~/.nvm/nvm.sh` (+ `nvm use default` silencioso)
  - `~/.asdf/asdf.sh`
  - PATH de Volta e fnm
  - `corepack enable` (best effort)
- Valida comandos obrigatorios (`node`, `pnpm`, `npx`) antes de iniciar serviços.
- Interrompe com mensagem clara quando dependencia nao existe, evitando falso positivo de “servicos iniciados”.
- Usa paths absolutos baseados no diretorio do script para reduzir fragilidade de execucao.

### Impacto
- Execucao local fica mais consistente entre terminal da maquina e terminal remoto do VS Code SSH.
- Diagnostico de ambiente ausente fica imediato e explicito.

## Tarefa 02 — Perfil de usuário, recuperação de senha e criação de usuários no admin

### Objetivo
Adicionar fluxo completo de conta do usuário com:
- página de perfil (alterar nome/e-mail/celular e senha),
- fluxo de esqueci/redefinir senha por e-mail com expiração de 2 horas,
- página admin para criação de usuários com funções `Administrador` e `Comum`,
- manter CPF imutável no perfil.

### Arquivos alterados
- `packages/contracts/src/index.ts`
- `packages/contracts/src/index.spec.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260226200000_add_password_reset_tokens/migration.sql`
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/auth/auth.module.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/auth/auth.types.ts`
- `apps/api/src/auth/auth-mail.service.ts`
- `apps/api/src/auth/auth.spec.ts`
- `apps/api/src/admin/admin.module.ts`
- `apps/api/src/admin/users/admin-users.controller.ts`
- `apps/api/src/admin/users/admin-users.service.ts`
- `apps/api/src/admin/users/admin-users.spec.ts`
- `apps/api/package.json`
- `apps/web/src/shared/hooks/use-auth.ts`
- `apps/web/src/shared/hooks/use-admin.ts`
- `apps/web/src/app/app/perfil/page.tsx`
- `apps/web/src/app/esqueci-senha/page.tsx`
- `apps/web/src/app/redefinir-senha/page.tsx`
- `apps/web/src/app/app/admin/usuarios/page.tsx`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/app/admin/eventos/page.tsx`
- `apps/web/src/app/app/admin/programas/page.tsx`
- `apps/web/src/app/app/inscricoes/page.tsx`
- `.context/docs/PROJECT_STATE.md`
- `.context/docs/REPOMAP.md`
- `pnpm-lock.yaml`

### O que mudou
- Contratos novos para:
  - atualização de perfil (`UpdateProfileInputSchema`),
  - troca de senha autenticada (`ChangePasswordInputSchema`),
  - recuperação de senha (`RequestPasswordReset*` e `ResetPasswordInputSchema`),
  - criação de usuário gerenciado (`CreateManagedUserInputSchema`).
- Novo modelo Prisma `password_reset_tokens` com hash do token, expiração e marcação de uso único.
- Novos endpoints de auth:
  - `PATCH /v1/auth/profile`
  - `PATCH /v1/auth/password`
  - `POST /v1/auth/password/forgot`
  - `POST /v1/auth/password/reset`
- Novo endpoint admin:
  - `POST /v1/admin/users` com regra:
    - `super_admin` pode criar `admin` e `citizen`,
    - `admin` pode criar apenas `citizen`.
- Novo serviço de e-mail de auth (`AuthMailService`) com envio SMTP e fallback resiliente.
- Auth `me/login/register` ajustados para retornar perfil consistente incluindo `phone` real.
- Novas páginas web:
  - `/app/perfil` (perfil + troca de senha, CPF somente leitura),
  - `/esqueci-senha` (solicitação de recuperação com aviso de expiração em 2h),
  - `/redefinir-senha` (definição de nova senha via token),
  - `/app/admin/usuarios` (criação de usuário admin/comum).
- Header das áreas autenticadas/admin atualizado com acesso à página de perfil e, no admin, à tela de usuários.
- Cobertura de testes ampliada em `auth.spec.ts` e novo `admin-users.spec.ts`.

### Impacto
- Usuários autenticados agora conseguem gerenciar seus dados e senha sem alterar CPF.
- Recuperação de senha passa a ser self-service com política explícita de expiração em 2 horas.
- Administração ganha fluxo dedicado para criação de usuários com controle de permissão por papel.
- Banco e contratos ficam sincronizados para suportar o novo ciclo de senha e gestão de contas.

## Tarefa 03 — Correção de timeout no login em ambiente dev com domínio público

### Objetivo
Evitar timeout no login quando o frontend em desenvolvimento roda com host público (ex.: `https://engaje.bandeirantesms.app.br`) sem `NEXT_PUBLIC_API_URL` disponível no runtime.

### Arquivos alterados
- `apps/web/src/shared/api-client.ts`
- `apps/web/src/shared/api-client.spec.ts`
- `.context/docs/REPOMAP.md`

### O que mudou
- O resolvedor de origem da API (`resolveApiUrl`) continua priorizando `NEXT_PUBLIC_API_URL`.
- No fallback de `development`, o uso de `hostname:3001` passou a ocorrer apenas para hosts locais/LAN (`localhost`, loopback, IP privado e `.local`).
- Para domínios públicos em `development`, o fallback agora usa `window.location.origin` (same-origin), evitando chamadas para `:3001` em HTTPS público.
- Testes de `api-client` foram ampliados com cenário explícito de domínio público em `development`.

### Impacto
- Corrige erro `net::ERR_CONNECTION_TIMED_OUT` no `POST /v1/auth/login` em dev quando a aplicação é acessada por domínio público.
- Mantém compatibilidade com fluxo de desenvolvimento em LAN/local.

## Tarefa 04 — Popup de inscrição admin/super admin, enumeração cronológica e exportação PDF

### Objetivo
Evoluir a visualização de inscrições do admin/super admin para:
- abrir detalhes da inscrição ao clicar na linha do candidato,
- exibir enumeração dos candidatos por ordem de cadastro,
- permitir exportação em PDF com todos os candidatos enumerados e seus dados de inscrição.

### Arquivos alterados
- `packages/contracts/src/index.ts`
- `packages/contracts/src/index.spec.ts`
- `apps/api/src/admin/events/admin-events.service.ts`
- `apps/api/src/admin/events/admin-events.spec.ts`
- `apps/web/package.json`
- `apps/web/src/shared/hooks/use-admin.ts`
- `apps/web/src/app/app/admin/eventos/[id]/inscricoes/page.tsx`
- `apps/web/src/components/admin/registration-details-modal.tsx`
- `apps/web/src/lib/registration-answers.ts`
- `apps/web/src/lib/registration-answers.spec.ts`
- `apps/web/src/lib/admin-registrations-pdf.ts`
- `apps/web/src/lib/admin-registrations-pdf.spec.ts`
- `pnpm-lock.yaml`
- `.context/docs/PROJECT_STATE.md`
- `.context/docs/REPOMAP.md`

### O que mudou
- Contrato de inscrições admin (`AdminRegistrationSchema`) passou a incluir `formData` (`Record<string, unknown> | null`).
- API admin de inscrições (`GET /v1/admin/events/:id/registrations`):
  - agora retorna `formData`,
  - agora ordena inscrições por `createdAt asc` (ordem cronológica de cadastro).
- Página admin de inscrições (`/app/admin/eventos/[id]/inscricoes`):
  - adicionada coluna de enumeração `#` por página com número absoluto,
  - clique na linha abre modal com dados da inscrição e respostas do formulário,
  - novo botão `Gerar PDF` ao lado de `Exportar CSV`.
- Novo fluxo de exportação PDF no frontend:
  - busca todas as páginas de inscrições (limit 200) antes de exportar,
  - gera PDF client-side com `jsPDF`,
  - inclui bloco por candidato (`Candidato 1, 2, 3...`) e informações preenchidas.
- Novos utilitários/testes no web para:
  - formatação e mapeamento de respostas dinâmicas,
  - ordenação cronológica,
  - cálculo da enumeração,
  - nome de arquivo PDF.
- Teste de integração da API admin atualizado para cobrir retorno de `formData`, ordenação ascendente e regra de acesso (403 para cidadão).

### Impacto
- Admin e super admin passam a auditar inscrições sem sair da listagem.
- Enumeração fica consistente com a ordem real de cadastro.
- Exportação PDF atende necessidade operacional com conteúdo completo da inscrição.
