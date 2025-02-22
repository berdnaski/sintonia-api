-- AlterTable
ALTER TABLE "users" ADD COLUMN     "coupleId" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "couples" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "couples_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couples"("id") ON DELETE SET NULL ON UPDATE CASCADE;
