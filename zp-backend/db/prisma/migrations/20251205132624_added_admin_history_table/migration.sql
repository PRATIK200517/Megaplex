-- CreateTable
CREATE TABLE "AdminHistory" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL DEFAULT 0,
    "action" TEXT NOT NULL DEFAULT 'Unknown',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminHistory_pkey" PRIMARY KEY ("id")
);
