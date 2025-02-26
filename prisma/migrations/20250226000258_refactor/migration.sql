/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `couples` table. All the data in the column will be lost.
  - You are about to drop the column `coupleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_CoupleUsers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user1Id]` on the table `couples` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user2Id]` on the table `couples` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `relationshipStatus` to the `couples` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user1Id` to the `couples` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Id` to the `couples` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('None', 'Monthly', 'Annual');

-- CreateEnum
CREATE TYPE "StatusPlan" AS ENUM ('NoPlan', 'Activated', 'Canceled');

-- DropForeignKey
ALTER TABLE "_CoupleUsers" DROP CONSTRAINT "_CoupleUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_CoupleUsers" DROP CONSTRAINT "_CoupleUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_coupleId_fkey";

-- AlterTable
ALTER TABLE "couples" DROP COLUMN "updatedAt",
ADD COLUMN     "relationshipStatus" TEXT NOT NULL,
ADD COLUMN     "user1Id" TEXT NOT NULL,
ADD COLUMN     "user2Id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "coupleId",
ADD COLUMN     "subscriptionStatus" "StatusPlan" NOT NULL DEFAULT 'NoPlan';

-- DropTable
DROP TABLE "_CoupleUsers";

-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_responses" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" "StatusPlan" NOT NULL DEFAULT 'NoPlan',
    "planType" "PlanType" NOT NULL DEFAULT 'None',
    "expiresIn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expiresIn" INTEGER NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "couples_user1Id_key" ON "couples"("user1Id");

-- CreateIndex
CREATE UNIQUE INDEX "couples_user2Id_key" ON "couples"("user2Id");

-- AddForeignKey
ALTER TABLE "couples" ADD CONSTRAINT "couples_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couples" ADD CONSTRAINT "couples_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_responses" ADD CONSTRAINT "ai_responses_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
