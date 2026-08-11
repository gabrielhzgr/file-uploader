/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "alt_indexes_missing" INTEGER[],
ADD COLUMN     "last_alt_index" INTEGER;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "alt_indexes_missing" INTEGER[],
ADD COLUMN     "last_alt_index" INTEGER;

