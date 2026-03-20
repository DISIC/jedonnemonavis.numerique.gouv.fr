-- Create an immutable wrapper around unaccent so it can be used in indexes
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text AS $$
  SELECT public.unaccent('public.unaccent', $1)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- Create GIN trigram index on the unaccented+lowered answer_text for verbatim answers
-- This speeds up LIKE queries on unaccent(lower(answer_text)) used by the search feature
CREATE INDEX IF NOT EXISTS answer_unaccent_text_verbatim_trgm_idx
ON public."Answer" USING GIN (public.immutable_unaccent(lower(answer_text)) gin_trgm_ops)
WHERE field_code = 'verbatim';
