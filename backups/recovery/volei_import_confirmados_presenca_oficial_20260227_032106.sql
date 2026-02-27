-- Import oficial Volei (somente confirmados por presenca)
-- Fonte: CSV de confirmados por event_attendance_intents
BEGIN;

CREATE TABLE IF NOT EXISTS public.staging_volei_confirmados_presenca_oficial (
  posicao_fila integer,
  user_id text,
  name text,
  email text,
  cpf text,
  phone text,
  user_created_at timestamp without time zone,
  intent_created_at_min timestamp without time zone,
  classificacao_final text,
  regra_classificacao text,
  tempo_referencia_posicao timestamp without time zone,
  criterio_posicao text
);

TRUNCATE TABLE public.staging_volei_confirmados_presenca_oficial;

-- Substitua o caminho do CSV abaixo caso use outro timestamp
-- \copy public.staging_volei_confirmados_presenca_oficial FROM 'backups/recovery/volei_confirmados_presenca_oficial_TIMESTAMP.csv' WITH (FORMAT csv, HEADER true);

COMMIT;
