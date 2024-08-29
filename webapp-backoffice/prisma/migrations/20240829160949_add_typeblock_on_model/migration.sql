/*
  Warnings:

  - Added the required column `type_bloc` to the `Block` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "type_bloc" "Typebloc" NOT NULL;
