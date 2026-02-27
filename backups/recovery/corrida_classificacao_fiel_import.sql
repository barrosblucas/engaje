-- Import script for: backups/recovery/corrida_classificacao_fiel_import.csv
-- Event: cmm169rtz0001l6zwic6vab6q
-- Date: 2026-02-27

BEGIN;

CREATE TABLE IF NOT EXISTS public.staging_corrida_classificacao_import (
  ordem_importacao integer,
  user_id text,
  name text,
  email text,
  cpf text,
  phone text,
  user_created_at timestamp without time zone,
  registration_created_at timestamp without time zone,
  intent_created_at timestamp without time zone,
  registration_origin text,
  in_event_window boolean,
  gap_min_to_nearest_confirmed numeric(10,2),
  classificacao_final text,
  regra_classificacao text,
  score_confianca integer
);

TRUNCATE TABLE public.staging_corrida_classificacao_import;

-- Ajuste o caminho absoluto conforme seu ambiente local.
COPY public.staging_corrida_classificacao_import
FROM '/home/thanos/engaje-dev/backups/recovery/corrida_classificacao_fiel_import.csv'
WITH (FORMAT csv, HEADER true);

-- Vista rápida para validação
SELECT classificacao_final, COUNT(*) AS total
FROM public.staging_corrida_classificacao_import
GROUP BY classificacao_final
ORDER BY
  CASE classificacao_final
    WHEN 'confirmado' THEN 1
    WHEN 'possivel_alto' THEN 2
    WHEN 'possivel_demais' THEN 3
    ELSE 4
  END;

COMMIT;
