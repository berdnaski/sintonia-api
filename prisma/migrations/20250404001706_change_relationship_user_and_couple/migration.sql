/*
  Warnings:

  - You are about to drop the column `user1Id` on the `couples` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `couples` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "couples" DROP CONSTRAINT "couples_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "couples" DROP CONSTRAINT "couples_user2Id_fkey";

-- DropIndex
DROP INDEX "couples_user1Id_key";

-- DropIndex
DROP INDEX "couples_user2Id_key";

-- AlterTable
ALTER TABLE "couples" DROP COLUMN "user1Id",
DROP COLUMN "user2Id";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "coupleId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couples"("id") ON DELETE SET NULL ON UPDATE CASCADE;
