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
