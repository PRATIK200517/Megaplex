/*
  Warnings:

  - A unique constraint covering the columns `[titile]` on the table `press_images` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `titile` to the `press_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notices" ALTER COLUMN "expiry" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "press_images" ADD COLUMN     "titile" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "press_images_titile_key" ON "press_images"("titile");
