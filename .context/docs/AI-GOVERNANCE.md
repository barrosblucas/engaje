# AI-GOVERNANCE (Manifesto Operacional)

Este repositório é **AI-Native**: o código é gerado por IA, mas **a qualidade é garantida por guardrails** (contratos, testes e CI).

## Leis (hard rules)
1. **TypeScript strict** (strict: true, noImplicitAny: true). Use `unknown` quando necessário e valide com Zod antes de usar. Proibido `any`, `@ts-ignore`, `eslint-disable` para “fugir” do tipo.
2. **Contract-first**: toda borda externa (HTTP/eventos/jobs) deve ter contrato em `packages/contracts`.
3. **Feature-first**: nada vive solto em `utils`/`services` genéricos. Tudo pertence a um domínio.
4. **Controllers finos** (API): controller valida → chama service → mapeia saída. Regra de negócio fica no service.
5. **Prisma isolado**: Prisma só em `repo.ts` e transação obrigatória quando tocar múltiplas entidades.
6. **Segurança**: sem secrets no código, sem PII em logs, sem logar payload bruto.
7. **Limites de tamanho**: soft 250 linhas; hard 400. Quebre em módulos.

## Definition of Done (DoD)
Nada está pronto sem:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

### Registro obrigatório por mudança (AI-Coded)
- Toda alteração implementada por IA deve gerar um changelog em `.context/docs/changelog/CHANGELOG_YYYY_MM_DD.md` (um arquivo por dia de mudança, `Tarefa 01`, `Tarefa 02`, etc), descrevendo objetivo, arquivos tocados e impacto.
- Sempre que a estrutura do repo mudar (novos pacotes, apps, scripts ou contratos), atualize `.context/docs/REPOMAP.md` e, se aplicável, links em `.context/docs/README.md`.

## CI Gates (obrigatórios)
- Secret scanning
- SCA (dependências)
- SAST (CodeQL)
- Migrações + testes obrigatórios

## Como trabalhar com IA
- Sempre forneça: objetivo, arquivos-alvo, contratos, testes e comandos que devem passar.
- Mudanças pequenas e isoladas por domínio.

## Frontend (decisão atual — SEO + segurança)

- Frontend é **Next.js 15 (App Router) + TailwindCSS v4 + shadcn/ui**.
- **Área autenticada (`/app/*`) é SPA**:
  - **Proibido SSR/SSG/ISR** para qualquer conteúdo **autenticado**.
  - Todo fetching de dados autenticados é **client-side** via **TanStack Query** e `shared/api-client.ts` (`credentials: "include"`).
  - `/app/*` deve ser **noindex** (SEO desabilitado).

- **Área pública (`/public/*`) é SEO-first**:
  - **Permitido SSR/SSG/ISR apenas para conteúdo público** (divulgação/indexação).
  - Fetch público pode ocorrer **no server** usando **`/v1/public/*`** (read-only + rate limit) para entregar HTML indexável.
  - Interações (busca, filtros, paginação avançada) podem hidratar e continuar via **TanStack Query no client**, usando o mesmo `shared/api-client.ts`.
  - **Nunca** renderizar no server dados que dependam de sessão/cookie de usuário.

## Rotas públicas vs privadas (hard rule — SEO + segurança)

- **Rotas públicas** vivem em `app/public/*`  
  - Indexáveis e otimizadas para SEO.
  - Usam apenas endpoints **`/v1/public/*`** (read-only + rate limit).
  - Podem ter SSR/SSG/ISR e metadata/JSON-LD.

- **Rotas autenticadas** vivem em `app/app/*`  
  - Exigem sessão via cookie **httpOnly**.
  - **Client-only** (SPA) + TanStack Query.
  - Bloqueadas para indexação (**noindex**, e opcionalmente `robots` disallow).

- Backend expõe:
  - `GET /v1/public/*` → **read-only + rate limit** (SEO + catálogo público)
  - `/v1/*` → **autenticado** (inscrições, perfil, operações do usuário)

- Auth preferencial: **cookie httpOnly (session)**
  - Frontend usa `credentials: "include"` no `shared/api-client.ts`.
  - Middleware protege `/app/*` (redirect para login quando sem cookie).


---

## Banco de Dados (PostgreSQL + Prisma)

- **Migrations são obrigatórias** para qualquer mudança em `prisma/schema.prisma`.
- **`schema.prisma` é documentação viva**: comentários (`///`) são obrigatórios em modelos/campos que carregam regra de negócio.
- **Performance**
  - Crie **índices** onde houver filtros/joins frequentes.
  - Evite **N+1**: use `include`/`select` com intenção explícita.
  - Prefira consultas previsíveis e pequenas; evite “query builder” dinâmico complexo.

## Protocolo de Desenvolvimento (AI Workflow)

### Ciclo TDD Assistido (obrigatório)
1) **Escreva o teste** (falhando) descrevendo a funcionalidade.
2) **Implemente** o mínimo para passar.
3) **Refine**: se falhar, alimente o erro de volta e corrija até passar.
- Ferramentas padrão:
  - **Vitest** (unit/contract) nos `packages/*`
  - **Jest + Supertest** (API e2e/unit) em `apps/api`
  - **Playwright** (E2E web)

### Auto-crítica (Self-Healing) antes de considerar pronto
O agente deve responder internamente:
- “Existe algum `any`/`@ts-ignore`/atalho de tipo?”
- “O arquivo ficou grande demais (soft 250 / hard 400)?”
- “Validei input com Zod no backend?”
- “Tratei erros e retornos (early returns, erros previsíveis)?”
- “Segui a estrutura feature-first e imports explícitos?”
- “Atualizei contratos e testes?”

### Documentação viva
- Atualize `.context/docs*` quando mudar:
  - regras globais de negócio
  - convenções e padrões
  - novas rotas públicas/privadas
- Use **TSDoc** em funções públicas para explicar o **PORQUÊ** (regra/decisão), não o COMO.

## Segurança & Governança

- **Secrets**: nunca hardcode chaves/senhas/tokens. Use `.env` (ver `.env.example`).
- **Sanitização**: **toda entrada** no backend deve ser validada com Zod (mesmo se o frontend validar).
- **PII**: nunca logue objetos completos de usuário; logue apenas IDs e metadados.
- **Dependencies**: execute auditorias regularmente (`pnpm audit`) e mantenha SCA/SAST no CI.

## Proibições absolutas (rollback imediato)
- Introduzir `any`, `@ts-ignore`, `eslint-disable` para contornar tipos
- Colocar regra de negócio em componentes UI (JSX/TSX)
- Commitar código que não passa `biome check` / `pnpm lint`
- Duplicar DTOs manualmente entre Front e Back (use `packages/contracts`)
- Alterar schema do banco sem **migration do Prisma**
- Logar PII/payload bruto (especialmente request body)

## Regras de ouro para IA (sempre)
1) **Contrato primeiro** (`packages/contracts`) → depois API → depois Web
2) **Mudanças mínimas**: 1 domínio por PR, 1 intenção por commit
3) **Localidade**: evite cadeias longas de import e “mágica”; preferir explícito
4) **Testes como especificação**: sem teste, sem feature
5) **Falhou no CI?** Corrija até passar — não contorne

- **Debug**: é proibido usar `console.log` em código commitado. Backend deve usar logger estruturado.
---

## Filosofia de Arquitetura (Atomicidade & Contexto)

### Princípio das 200 linhas (Context Window Optimization)
- LLMs perdem precisão conforme o arquivo cresce.
- **Regra**: arquivos de lógica (Services, Controllers, Hooks) devem ficar em **200–250 linhas**.
- **Ação**: ao atingir o limite, **refatore imediatamente** (composition, extração de helpers puros, command/handler).
- **Exceções**: arquivos gerados automaticamente/config (evitar quando possível).

### Design modular e baixo acoplamento
- **Atomicidade**: cada função/classe faz uma coisa.
- **Localidade**: co-aloque tipos e testes perto da implementação quando fizer sentido.
- **Barrel files**: evite `index.ts` profundos que exportam tudo; prefira imports explícitos.
## Zod First (Schema Driven Development)
- Nunca escreva interfaces TypeScript manualmente quando derivadas de dados externos (API/DB).
- Defina o **schema Zod** → infira tipos com `z.infer<typeof Schema>` → valide runtime.
- Benefício: tipagem estática e validação runtime sincronizadas, reduzindo alucinações.
## Nomenclatura semântica
- Variáveis devem descrever conteúdo e tipo (evite `data`, `list`, `u`).
- Funções: **Verbo + Substantivo** (`getUserById`, `createTransaction`).

## Logs (Backend)
- Use **Pino** (JSON) e redaction; nunca use `console.log`.



