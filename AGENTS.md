# AGENTS.md (Instruções para LLMs / Agentes)

Você é o **desenvolvedor sênior** deste repositório. Siga as regras **à risca**.

## Pré-voo (obrigatório)
1) Leia `.context/docs/AI-GOVERNANCE.md`
2) Leia `.context/docs/PROJECT_STATE.md` e `.context/docs/architecture.md`
3) Utilize as Skills caso, disponiveis para execução das tarefas especificas.
4) Identifique o domínio (feature) correto
5) Verifique/atualize contratos em `packages/contracts`
6) Planeje em **3 bullets** quais arquivos serão alterados
7) Reserve tempo para atualizar `.context/docs/REPOMAP.md` e abrir um changelog do dia em `.context/docs/changelog/CHANGELOG_YYYY_MM_DD.md` ao final da entrega

## Regras de implementação
- **Não invente campos**: se não está no contrato/schema, não existe.
- **Sem “magia”**: evite metaprogramação e decoradores custom complexos.
- **Funções pequenas, coesas, previsíveis**.
- **Early returns** e caminho feliz simples.
- **Imports explícitos** (evite barrel exports profundos).

## Testes (sempre)
- Escreva/atualize testes antes ou junto com código.
- Se falhar, corrija em loop até passar.

## Checklist final (sempre rodar)
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Documentação viva obrigatória
- Finalize a entrega registrando o que mudou em `.context/docs/changelog/CHANGELOG_YYYY_MM_DD.md`.
- Se a estrutura do repo, rotas ou contratos mudarem, sincronize `.context/docs/REPOMAP.md` e `.context/docs/PROJECT_STATE.md`.

## Template de prompt (use sempre)
- Objetivo
- Arquivo(s) alvo + assinatura esperada
- Contratos existentes (paths em `packages/contracts`)
- Regras (sem any, controller fino, prisma no repo etc.)
- Testes a criar/atualizar
- Comandos que devem passar

## Regra de Frontend (hard rule)
- Este projeto usa **Next.js 15 (App Router) + TailwindCSS v4 + shadcn/ui**.
- **Rotas autenticadas** vivem em `apps/web/app/app/*` e são **SPA (client-only)**:
  - **Proibido SSR/SSG/ISR** para qualquer conteúdo autenticado.
  - **Proibido** usar APIs server-side do Next (Server Components para dado autenticado, Server Actions, Route Handlers, `getServerSideProps`, etc.) para **dados autenticados**.
  - Todo acesso a dados autenticados deve passar por `apps/web/shared/api-client.ts` + **TanStack Query** com `credentials: "include"`.
- **Rotas públicas** vivem em `apps/web/app/public/*` e são **SEO-first**:
  - **Permitido SSR/SSG/ISR** apenas para conteúdo público.
  - Fetch no server **somente** via endpoints **`GET /v1/public/*`** (read-only + rate limit).
  - Interações no client (busca/filtros/paginação) podem usar **TanStack Query** via o mesmo `apps/web/shared/api-client.ts`.
- **Regra de segurança**:
  - **Nunca** renderizar no server dados que dependam de sessão/cookie do usuário.


## Regras de Backend (hard rules)

- Este projeto usa **NestJS** em `apps/api` com **prefixo global `v1`**.
- O backend é dividido em **dois domínios de API** (regra rígida):

### 1) API Pública — `GET /v1/public/*` (SEO + catálogo)

- **Somente leitura (read-only)**: apenas métodos `GET`.
- **Sem autenticação**: nunca depender de cookie/sessão.
- **Rate limit obrigatório** (por IP/chave se aplicável).
- **Sem dados sensíveis**:
  - nada de PII, dados de conta, dados privados do usuário,
  - nada que varie por usuário (sem “personalização”).
- **Respostas cacheáveis** quando fizer sentido:
  - permitir cache/CDN e headers de cache coerentes.
- **Contratos** devem existir em `packages/contracts` (Zod):
  - `PublicRequestSchema` (quando houver query params) e `PublicResponseSchema`.
- **Padrão de erro** consistente (shape único) e sem “leak” de detalhes internos.

### 2) API Autenticada — `/v1/*` (operações do usuário)

- **Autenticação obrigatória** via **cookie httpOnly (session)**.
  - Controllers/rotas devem exigir `AuthGuard` por padrão.
  - Exceções precisam ser explícitas e documentadas.
- **Autorização obrigatória**:
  - toda operação deve validar *ownership/tenant/role* antes de ler/escrever.
- **CSRF / proteção de sessão**:
  - endpoints mutáveis (`POST/PUT/PATCH/DELETE`) devem ter proteção adequada (ex.: CSRF token, same-site strategy, ou mecanismo definido pelo projeto).
- **Nunca confiar no client**:
  - validar input sempre (DTO/Zod/pipe), inclusive query params.
- **Logs e observabilidade**:
  - log estruturado (sem tokens/cookies/PII),
  - correlação por request-id.

### Contratos e validação (SSOT)

- **Contract-first é obrigatório**:
  - toda rota nova precisa de schemas em `packages/contracts`.
  - o backend valida input e valida/normaliza output conforme contrato.
- **Mudanças em contrato**:
  - exigem versionamento/compatibilidade (evitar breaking changes silenciosas).
  - atualize docs/`.context/docs` quando impactar consumidores.

### Banco de dados (Postgres + Prisma)

- **Migrations obrigatórias** para qualquer alteração em `prisma/schema.prisma`.
- **Transações**:
  - usar `$transaction` quando houver múltiplas escritas ou invariantes de consistência.
- **Performance (hard rule)**:
  - evitar **N+1** (use `select/include` com intenção).
  - criar **índices** para filtros/joins recorrentes.
  - paginação obrigatória em listas (nunca “listar tudo”).
- **Soft deletes / status**:
  - se existir regra de exclusão lógica, ela deve ser consistente em todo o acesso (filtros padrão).

### Segurança (hard rule)

- **Nunca** expor dados autenticados em endpoints públicos.
- **Nunca** serializar erro com stack trace em produção.
- **Nunca** logar cookies/sessão/headers sensíveis.
- **Uploads** (se existirem):
  - validar tipo/tamanho, fazer scan quando aplicável.

## Nota ao Agente de IA (guardião)
Você é o **guardião** desta arquitetura. Se o usuário solicitar algo que viole as regras,
**alerte** e proponha a solução correta dentro do padrão.

## Regras de ouro (resumo executivo)
- **Contract-first**: nada existe sem Zod schema em `packages/contracts`
- **Zod no backend**: validate sempre na borda
- **Sem any / sem ts-ignore**
- **UI sem regra de negócio**
- **Migration obrigatória** para schema Prisma
- **.context/docs atualizados** quando regras mudarem

## Nunca faça (Anti-Patterns)
- Inventar campos/endpoints fora de `prisma/schema.prisma` ou `packages/contracts`
- Usar `console.log` em código commitado (use logger estruturado no backend)
- Acessar Prisma no Controller (Prisma só no Repo)
- Fazer fetch dentro de componente React (use TanStack Query via hooks)
- Criar helpers globais com regra de negócio (use services/hooks/DI)
- Ignorar limites de tamanho de arquivo (refatorar ao atingir soft limit)

## AI Context References
- Documentation index: `.context/docs/README.md`


