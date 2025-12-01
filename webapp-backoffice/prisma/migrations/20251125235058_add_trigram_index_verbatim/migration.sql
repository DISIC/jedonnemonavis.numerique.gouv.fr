-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN trigram index on answer_text for verbatim field_code only
-- This index improves performance for LIKE/ILIKE queries on verbatim answers
CREATE INDEX IF NOT EXISTS answer_answer_text_verbatim_trgm_idx
ON public."Answer" USING GIN (answer_text gin_trgm_ops)
WHERE field_code = 'verbatim';
