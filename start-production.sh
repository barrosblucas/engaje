#!/usr/bin/env bash

set -euo pipefail

# Script para iniciar API e Web em produção

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$HOME/.bashrc" ]; then
	# shellcheck disable=SC1090
	source "$HOME/.bashrc"
fi

if [ -s "$HOME/.nvm/nvm.sh" ]; then
	# shellcheck disable=SC1090
	source "$HOME/.nvm/nvm.sh"
	nvm use --silent default >/dev/null 2>&1 || true
fi

if [ -f "$HOME/.asdf/asdf.sh" ]; then
	# shellcheck disable=SC1090
	source "$HOME/.asdf/asdf.sh"
fi

if [ -d "$HOME/.volta/bin" ]; then
	export PATH="$HOME/.volta/bin:$PATH"
fi

if [ -d "$HOME/.local/share/fnm" ]; then
	export PATH="$HOME/.local/share/fnm:$PATH"
fi

if command -v corepack >/dev/null 2>&1; then
	corepack enable >/dev/null 2>&1 || true
fi

for cmd in node pnpm npx; do
	if ! command -v "$cmd" >/dev/null 2>&1; then
		echo "Erro: comando '$cmd' nao encontrado no PATH."
		echo "Dica: abra um shell de login ou configure Node.js + pnpm no usuario atual."
		exit 1
	fi
done

cleanup() {
	local code=$?
	if [ "$code" -ne 0 ]; then
		echo "Falha ao iniciar os servicos."
	fi
}
trap cleanup EXIT

echo "Iniciando API..."
cd "$SCRIPT_DIR/apps/api"
pnpm build
node dist/main.js &

echo "Iniciando Web..."
cd "$SCRIPT_DIR/apps/web"
pnpm build
npx next start &

echo "Ambos servicos iniciados em background."
echo "API: http://localhost:3001"
echo "Web: http://localhost:3000"