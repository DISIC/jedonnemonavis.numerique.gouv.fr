-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'supervisor';

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "button_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id", "created_at")
) PARTITION BY RANGE (created_at);

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "answer_text" TEXT NOT NULL,
    "answer_score" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_code" TEXT NOT NULL,
    "review_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id", "created_at"),
    CONSTRAINT "Answer_review_id_created_at_fkey" FOREIGN KEY ("review_id", "created_at") REFERENCES "Review" ("id", "created_at")
) PARTITION BY RANGE (created_at);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_button_id_fkey" FOREIGN KEY ("button_id") REFERENCES "Button"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_review_id_fkey" FOREIGN KEY ("review_id", "created_at") REFERENCES "Review"("id", "created_at") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Create monthly partitions for the new partitioned tables from July 2018 to December 2030
DO $$
DECLARE
    start_time TIMESTAMP := '2018-07-01 00:00:00';
    end_time TIMESTAMP;
    partition_name TEXT;
BEGIN
    WHILE start_time < '2031-01-01 00:00:00' LOOP
        end_time := start_time + INTERVAL '1 month';
        partition_name := to_char(start_time, 'YYYYMM');
        
        -- Creating partitions for Review table
        EXECUTE format('
            CREATE TABLE IF NOT EXISTS public."Review_p%s" PARTITION OF public."Review"
            FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_time, end_time);
        
        -- Creating partitions for Answer table
        EXECUTE format('
            CREATE TABLE IF NOT EXISTS public."Answer_p%s" PARTITION OF public."Answer"
            FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_time, end_time);
        
        start_time := end_time;
    END LOOP;
END $$;
