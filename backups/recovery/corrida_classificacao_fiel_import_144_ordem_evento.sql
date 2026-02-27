-- Import script for event-ordered file:
-- /home/thanos/engaje-dev/backups/recovery/corrida_classificacao_fiel_import_144_ordem_evento.csv

BEGIN;

CREATE TABLE IF NOT EXISTS public.staging_corrida_classificacao_import (
  ordem_evento_144 integer,
  user_id text,
  name text,
  email text,
  cpf text,
  phone text,
  classificacao_final text,
  registration_origin text,
  user_created_at timestamp without time zone,
  registration_created_at timestamp without time zone,
  intent_created_at timestamp without time zone,
  tempo_referencia_ordenacao timestamp without time zone,
  criterio_ordenacao text,
  gap_min_to_nearest_confirmed numeric(10,2)
);

TRUNCATE TABLE public.staging_corrida_classificacao_import;

COPY public.staging_corrida_classificacao_import
FROM '/home/thanos/engaje-dev/backups/recovery/corrida_classificacao_fiel_import_144_ordem_evento.csv'
WITH (FORMAT csv, HEADER true);

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
