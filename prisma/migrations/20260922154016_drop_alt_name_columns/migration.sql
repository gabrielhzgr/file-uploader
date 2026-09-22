/*
  Warnings:

  - You are about to drop the column `alt_indexes_missing` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `last_alt_index` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `alt_indexes_missing` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `last_alt_index` on the `Folder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "alt_indexes_missing",
DROP COLUMN "last_alt_index";

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "alt_indexes_missing",
DROP COLUMN "last_alt_index";
