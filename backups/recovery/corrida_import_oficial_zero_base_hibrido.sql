-- Import oficial (zero base - híbrido)
-- CSV: /home/thanos/engaje-dev/backups/recovery/corrida_import_oficial_zero_base_hibrido.csv
-- Regra de posição:
-- - confirmado_inscricao_real -> usa registration_created_at_min
-- - demais -> usa user_created_at

BEGIN;

CREATE TABLE IF NOT EXISTS public.staging_corrida_import_oficial_zero_base_hibrido (
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
  regra_classificacao text,
  tempo_referencia_posicao timestamp without time zone,
  criterio_posicao text
);

TRUNCATE TABLE public.staging_corrida_import_oficial_zero_base_hibrido;

COPY public.staging_corrida_import_oficial_zero_base_hibrido
FROM '/home/thanos/engaje-dev/backups/recovery/corrida_import_oficial_zero_base_hibrido.csv'
WITH (FORMAT csv, HEADER true);

SELECT classificacao_final, COUNT(*) AS total
FROM public.staging_corrida_import_oficial_zero_base_hibrido
GROUP BY classificacao_final
ORDER BY classificacao_final;

COMMIT;
