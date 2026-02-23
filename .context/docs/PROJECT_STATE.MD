```markdown
---
ai_update_goal: "Manter o estado atual do projeto, lista de funcionalidades e dívidas técnicas atualizadas."
required_inputs: ["git status", "file structure", "routes definition"]
success_criteria: "Refletir com precisão a estrutura do monorepo, domínios ativos e roadmap técnico."
---

# PROJECT_STATE (Memória Viva)

<!-- agent-update:start:overview -->
## Visão Geral
Este repositório opera sob uma estrutura de **monorepo**, organizando o código em:
- **`apps/`**: Aplicações principais (front-end/back-end).
- **`packages/`**: Bibliotecas compartilhadas e configurações.
- **`prisma/`**: Camada de dados e ORM (PostgreSQL único).
- **`scripts/`**: Utilitários de automação.
- **`.context/docs/`**: Documentação viva, incluindo `REPOMAP.md` (mapa estrutural) e changelogs diários obrigatórios para mudanças implementadas por IA.
<!-- agent-update:end -->

<!-- agent-update:start:domains -->
## Domínios Implementados

### Users

### Example
Examplo

<!-- agent-update:start:api-routes -->
## Rotas API Ativas

| Método | Endpoint | Descrição | Status |
| :--- | :--- | :--- | :--- |
| `POST` | `/v1/users` | Criação de novos usuários | Ativo |
| `GET` | `/v1/users` | Listagem de usuários | Ativo |

<!-- agent-update:end -->

<!-- agent-update:start:database -->
## Estrutura do Banco de Dados

### PostgreSQL (Único)
- **Users**: `users` — Autenticação e autorização
<!-- agent-update:end -->

<!-- agent-update:start:roadmap -->
## Pendências e Roadmap Técnico

### Concluído Recentemente (YYYY-MM-DD)
- [ ] **Exemple → Example**: Example
- [ ] **User model**: Criar modelo de usuário no Prisma e endpoints CRUD.
<!-- agent-update:end -->
```
