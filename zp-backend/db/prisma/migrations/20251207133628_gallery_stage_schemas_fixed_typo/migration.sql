/*
  Warnings:

  - You are about to drop the column `thumbail_image` on the `folders` table. All the data in the column will be lost.
  - Added the required column `thumbnail_image` to the `folders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "folders" DROP COLUMN "thumbail_image",
ADD COLUMN     "thumbnail_image" JSONB NOT NULL;
