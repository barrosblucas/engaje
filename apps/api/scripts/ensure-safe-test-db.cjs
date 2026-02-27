#!/usr/bin/env node

const databaseUrl = process.env.DATABASE_URL ?? '';

if (!databaseUrl) {
  process.stderr.write('DATABASE_URL não definido para testes.\n');
  process.exit(1);
}

const safePatterns = [/test/i, /shadow/i, /codex/i];
const isSafe = safePatterns.some((pattern) => pattern.test(databaseUrl));

if (!isSafe) {
  process.stderr.write(
    'Execução de testes bloqueada: DATABASE_URL não parece ser banco de teste.\n',
  );
  process.stderr.write(`DATABASE_URL atual: ${databaseUrl}\n`);
  process.exit(1);
}
