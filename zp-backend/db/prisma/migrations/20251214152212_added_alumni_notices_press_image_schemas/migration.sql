-- CreateTable
CREATE TABLE "Alumni" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "designition" TEXT NOT NULL,
    "instaUrl" TEXT,
    "xurl" TEXT,
    "email" TEXT,
    "linkedIn" TEXT,

    CONSTRAINT "Alumni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notices" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 day',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "press_images" (
    "id" SERIAL NOT NULL,
    "fileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "height" INTEGER,
    "width" INTEGER,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "press_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alumni_name_idx" ON "Alumni"("name");

-- CreateIndex
CREATE UNIQUE INDEX "press_images_fileId_key" ON "press_images"("fileId");
