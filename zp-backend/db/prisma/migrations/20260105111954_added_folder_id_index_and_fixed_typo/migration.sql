/*
  Warnings:

  - You are about to drop the column `titile` on the `press_images` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `press_images` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `press_images` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "press_images_titile_key";

-- AlterTable
ALTER TABLE "Notices" ALTER COLUMN "expiry" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "press_images" DROP COLUMN "titile",
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "gallery_images_folder_id_idx" ON "gallery_images"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "press_images_title_key" ON "press_images"("title");
