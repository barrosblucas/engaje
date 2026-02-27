# CHANGELOG 2026-02-27

## Tarefa 01 — Padronização de portas no modo desenvolvimento (`WEB 3100`, `API 3200`)

### Objetivo
Atualizar o ambiente de desenvolvimento para usar:
- frontend web em `http://localhost:3100`
- backend API em `http://localhost:3200`

### Arquivos alterados
- `apps/web/package.json`
- `apps/api/package.json`
- `apps/api/src/main.ts`
- `apps/web/next.config.ts`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/shared/api-client.ts`
- `apps/web/src/shared/api-client.spec.ts`
- `apps/web/src/lib/public-api-base.ts`
- `apps/web/src/lib/public-api-base.spec.ts`
- `apps/web/src/lib/public-share.ts`
- `apps/web/src/lib/public-share.spec.ts`
- `apps/api/src/config/app-origins.ts`
- `apps/api/src/config/app-origins.spec.ts`
- `apps/api/src/auth/google.strategy.ts`
- `.env.example`
- `.context/docs/PROJECT_STATE.md`
- `.context/docs/REPOMAP.md`

### O que mudou
- Script `dev` do web alterado para `next dev -p 3100`.
- Script `dev` da API passou a exportar `PORT=3200`.
- Porta fallback da API no bootstrap (`main.ts`) alterada de `3001` para `3200`.
- Fallbacks de origem da API no frontend (`api-client`, `public-api-base`, `next.config`) atualizados para `3200`.
- Fallback de `metadataBase` e base pública de compartilhamento no web atualizados para `3100`.
- Configuração de CORS local no backend (`app-origins`) atualizada para `3100` por padrão.
- Fallback da URL de callback do Google OAuth ajustado para `http://localhost:3200/v1/auth/google/callback`.
- `.env.example` atualizado para refletir as novas portas.
- Testes unitários de configuração/fallback atualizados para os novos valores de porta.

### Impacto
- Execução local em modo desenvolvimento fica consistente com o novo padrão de portas.
- Evita falhas de CORS e chamadas para porta antiga quando variáveis não estão explicitamente configuradas.

## Tarefa 02 — Acesso da API via rede local (LAN) em desenvolvimento

### Objetivo
Corrigir falha `ERR_CONNECTION_REFUSED` ao consumir a API via IP da máquina (`http://192.168.1.21:3200`) no ambiente de desenvolvimento.

### Arquivos alterados
- `apps/api/src/main.ts`

### O que mudou
- Bootstrap da API passou a utilizar host configurável por ambiente (`HOST`) com fallback para `0.0.0.0`.
- Inicialização alterada para `app.listen(port, host)`, mantendo `PORT=3200` como fallback.
- Log de inicialização da API agora inclui explicitamente o `host` utilizado.

### Impacto
- A API deixa de escutar apenas em loopback (`localhost`) e passa a aceitar conexões externas na rede local.
- Requisições do frontend para `http://192.168.1.21:3200` em desenvolvimento passam a alcançar o backend quando o processo está ativo.

## Tarefa 03 — Inicialização da API sem credenciais Google em dev/test

### Objetivo
Evitar queda da API em desenvolvimento/testes quando `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` não estiverem definidos.

### Arquivos alterados
- `apps/api/src/auth/google-auth-config.ts`
- `apps/api/src/auth/google-auth-config.spec.ts`
- `apps/api/src/auth/google-auth.guard.ts`
- `apps/api/src/auth/google.strategy.ts`
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/auth/auth.module.ts`

### O que mudou
- Configuração do Google OAuth extraída para helper com regra:
  - em `development/test`: usa credenciais placeholder (não derruba a API);
  - em `production`: mantém falha explícita sem credenciais válidas.
- Estratégia `GoogleStrategy` passa a consumir o helper centralizado.
- Novo `GoogleAuthGuard` retorna `503` quando Google OAuth não está habilitado no ambiente.
- Rotas `/v1/auth/google` e `/v1/auth/google/callback` passaram a usar o guard dedicado.
- Testes unitários adicionados para cobrir cenários com/sem credenciais e produção.

### Impacto
- Login local (`/v1/auth/login`) não é mais bloqueado por ausência de configuração de OAuth Google.
- Em dev/test, a API sobe normalmente e permite autenticação local por CPF/e-mail e senha.

## Tarefa 04 — Carregamento automático de `.env` da raiz nos scripts da API

### Objetivo
Garantir que `pnpm run dev` na raiz do monorepo carregue `DATABASE_URL` e demais variáveis da API sem export manual no shell.

### Arquivos alterados
- `apps/api/package.json`

### O que mudou
- Script `dev` da API passou a executar Nest com preload de `dotenv/config` e `DOTENV_CONFIG_PATH=../../.env`.
- Script `start` da API passou a carregar `../../.env` no runtime.
- Scripts `test` e `test:watch` da API também passaram a carregar `../../.env`.

### Impacto
- A API deixa de cair no bootstrap por ausência de `DATABASE_URL` quando iniciada via Turborepo.
- Erro `POST .../v1/auth/login net::ERR_CONNECTION_REFUSED` deixa de ocorrer por backend desligado nesse cenário.

## Tarefa 05 — Proteção contra perda de dados em testes de integração da API

### Objetivo
Evitar deleção acidental de registros reais ao executar testes de integração em ambiente com banco compartilhado.

### Arquivos alterados
- `apps/api/src/public/events/public-events.spec.ts`
- `apps/api/scripts/ensure-safe-test-db.cjs`
- `apps/api/package.json`
- `.env.example`

### O que mudou
- Removido `deleteMany({})` global em `registrations` no teardown do teste público de eventos.
- Teardown passou a remover apenas inscrições vinculadas aos eventos criados pelo próprio teste (`event.createdById = adminUserId`).
- Scripts `test`, `test:watch` e `test:cov` da API agora:
  - carregam variáveis de `../../.env.test`;
  - executam um guard que bloqueia testes se `DATABASE_URL` não parecer banco de teste.
- `.env.example` recebeu orientação explícita para criação de `.env.test` com banco dedicado.

### Impacto
- Reduz drasticamente risco de perda de dados reais ao rodar `pnpm test`.
- Mantém limpeza de dados de teste sem atingir registros de produção/desenvolvimento compartilhado.

## Tarefa 06 — Recuperação emergencial de inscrições por ordem cronológica

### Objetivo
Restabelecer associação usuário-evento e ordenação cronológica de inscritos para seleção de brindes, mesmo sem backup prévio da tabela `registrations`.

### Ações executadas
- Snapshot de segurança criado antes da intervenção:
  - `backups/registrations_emergency_20260227_010440.sql`
  - `backups/full_emergency_20260227_010445.dump`
- Para o evento `cmm169rtz0001l6zwic6vab6q` (`1ª Corrida Dia Internacional da Mulher`):
  - Inseridas 71 inscrições recuperadas com base em `event_attendance_intents` ausentes em `registrations`.
  - Campo `form_data` marcado com metadados de auditoria:
    - `_recovered_from = attendance_intent`
    - `_recovered_at = timestamp`
- Exportadas listas ordenadas para conferência:
  - `backups/recovery/corrida_ordenacao_completa.csv`
  - `backups/recovery/corrida_primeiros_50.csv`
  - `backups/recovery/corrida_registrations_ordenadas_pos_recuperacao.csv`
  - `backups/recovery/corrida_primeiros_50_pos_recuperacao.csv`

### Resultado
- Total de inscrições do evento após recuperação: 77.
- Top 50 cronológico disponível para decisão de brinde.

### Observação importante
- Sem backup histórico e com autovacuum já executado, a recuperação é inferida por intenção de presença (`attendance_intent`) e não reconstrói respostas originais de formulário dinâmico perdidas.
