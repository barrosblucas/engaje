-- Import oficial (zero base) para a Corrida
-- Arquivo CSV: /home/thanos/engaje-dev/backups/recovery/corrida_import_oficial_zero_base.csv
-- Critério: ordenação por users.created_at e classificação por evidência de inscrição/presença

BEGIN;

CREATE TABLE IF NOT EXISTS public.staging_corrida_import_oficial_zero_base (
  posicao_fila integer,
  user_id text,
  name text,
  email text,
  cpf text,
  phone text,
  user_created_at timestamp without time zone,
  registration_created_at_min timestamp without time zone,
  intent_created_at_min timestamp without time zone,
  has_registration_original boolean,
  has_registration_recovered boolean,
  intent_count integer,
  classificacao_final text,
  regra_classificacao text
);

TRUNCATE TABLE public.staging_corrida_import_oficial_zero_base;

COPY public.staging_corrida_import_oficial_zero_base
FROM '/home/thanos/engaje-dev/backups/recovery/corrida_import_oficial_zero_base.csv'
WITH (FORMAT csv, HEADER true);

SELECT classificacao_final, COUNT(*) AS total
FROM public.staging_corrida_import_oficial_zero_base
GROUP BY classificacao_final
ORDER BY classificacao_final;

COMMIT;
