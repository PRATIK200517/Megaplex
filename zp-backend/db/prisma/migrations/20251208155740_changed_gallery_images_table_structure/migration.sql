/*
  Warnings:

  - You are about to drop the column `image_data` on the `gallery_images` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileId]` on the table `gallery_images` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileId` to the `gallery_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `gallery_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gallery_images" DROP COLUMN "image_data",
ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "width" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "gallery_images_fileId_key" ON "gallery_images"("fileId");
