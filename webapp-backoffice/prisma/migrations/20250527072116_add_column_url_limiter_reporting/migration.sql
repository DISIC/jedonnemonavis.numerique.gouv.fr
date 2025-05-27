/*
  Warnings:

  - Added the required column `url` to the `LimiterReporting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LimiterReporting" ADD COLUMN     "url" TEXT NOT NULL;
