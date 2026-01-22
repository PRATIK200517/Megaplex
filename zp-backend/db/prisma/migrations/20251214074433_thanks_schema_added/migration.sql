-- CreateTable
CREATE TABLE "Thanks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thanks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Thanks_isFeatured_idx" ON "Thanks"("isFeatured");

-- CreateIndex
CREATE INDEX "Thanks_title_idx" ON "Thanks"("title");
