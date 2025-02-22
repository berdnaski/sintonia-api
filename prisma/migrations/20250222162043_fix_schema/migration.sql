/*
  Warnings:

  - You are about to drop the `_CoupleUsers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user1Id]` on the table `couples` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user2Id]` on the table `couples` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coupleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `relationshipStatus` to the `couples` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user1Id` to the `couples` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Id` to the `couples` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CoupleUsers" DROP CONSTRAINT "_CoupleUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_CoupleUsers" DROP CONSTRAINT "_CoupleUsers_B_fkey";

-- AlterTable
ALTER TABLE "couples" ADD COLUMN     "relationshipStatus" TEXT NOT NULL,
ADD COLUMN     "user1Id" TEXT NOT NULL,
ADD COLUMN     "user2Id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "subscriptionStatus" TEXT;

-- DropTable
DROP TABLE "_CoupleUsers";

-- CreateIndex
CREATE UNIQUE INDEX "couples_user1Id_key" ON "couples"("user1Id");

-- CreateIndex
CREATE UNIQUE INDEX "couples_user2Id_key" ON "couples"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "users_coupleId_key" ON "users"("coupleId");

-- AddForeignKey
ALTER TABLE "couples" ADD CONSTRAINT "couples_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couples" ADD CONSTRAINT "couples_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
