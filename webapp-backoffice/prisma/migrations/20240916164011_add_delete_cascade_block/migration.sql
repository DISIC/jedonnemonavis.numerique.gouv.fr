-- DropForeignKey
ALTER TABLE "OptionsBlock" DROP CONSTRAINT "OptionsBlock_block_id_fkey";

-- AddForeignKey
ALTER TABLE "OptionsBlock" ADD CONSTRAINT "OptionsBlock_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
