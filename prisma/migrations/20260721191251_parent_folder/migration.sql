-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "parent_folder_id" TEXT;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
