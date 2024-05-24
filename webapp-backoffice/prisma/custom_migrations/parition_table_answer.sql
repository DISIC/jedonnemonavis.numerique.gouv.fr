-- Create Mother table
CREATE TABLE public."AnswerMother" (
        id serial4 NOT NULL,
        field_label text NOT NULL,
        field_code text NOT NULL,
        answer_item_id int4 NOT NULL,
        answer_text text NOT NULL,
        intention public."AnswerIntention" NULL,
        kind public."AnswerKind" NOT NULL,
        review_id int4 NOT NULL,
        CONSTRAINT "AnswerMother_pkey" PRIMARY KEY (id, field_code),
        CONSTRAINT "AnswerMother_review_id_fkey" FOREIGN KEY (review_id) REFERENCES public."Review"(id) ON DELETE RESTRICT ON UPDATE CASCADE
) PARTITION BY LIST (field_code);

-- Create partitions
CREATE TABLE public."AnswerEasy" PARTITION OF "AnswerMother" FOR VALUES IN ('easy');
CREATE TABLE public."AnswerComprehension" PARTITION OF "AnswerMother" FOR VALUES IN ('comprehension');
CREATE TABLE public."AnswerSatisfaction" PARTITION OF "AnswerMother" FOR VALUES IN ('satisfaction');
CREATE TABLE public."AnswerDifficulties" PARTITION OF "AnswerMother" FOR VALUES IN ('difficulties');
CREATE TABLE public."AnswerHelp" PARTITION OF "AnswerMother" FOR VALUES IN ('help');
CREATE TABLE public."AnswerVerbatim" PARTITION OF "AnswerMother" FOR VALUES IN ('verbatim');
CREATE TABLE public."AnswerDifficultiesDetails" PARTITION OF "AnswerMother" FOR VALUES IN ('difficulties_details');
CREATE TABLE public."AnswerDefault" PARTITION OF "AnswerMother" DEFAULT;

-- Change owner
ALTER TABLE "AnswerMother" OWNER TO jdma_user;
ALTER TABLE "AnswerEasy" OWNER TO jdma_user;
ALTER TABLE "AnswerComprehension" OWNER TO jdma_user;
ALTER TABLE "AnswerSatisfaction" OWNER TO jdma_user;
ALTER TABLE "AnswerDifficulties" OWNER TO jdma_user;
ALTER TABLE "AnswerHelp" OWNER TO jdma_user;
ALTER TABLE "AnswerVerbatim" OWNER TO jdma_user;
ALTER TABLE "AnswerDifficultiesDetails" OWNER TO jdma_user;
ALTER TABLE "AnswerDefault" OWNER TO jdma_user;

-- Insert in new table for partiotionning
INSERT INTO public."AnswerMother" (id, field_label, field_code, answer_item_id, answer_text, intention, kind, review_id) SELECT id, field_label, field_code, answer_item_id, answer_text, intention::public."AnswerIntention", kind, review_id FROM public."Answer"

-- Change names
ALTER TABLE public."Answer" RENAME TO "AnswerOld";
ALTER TABLE public."AnswerMother" RENAME TO "Answer";