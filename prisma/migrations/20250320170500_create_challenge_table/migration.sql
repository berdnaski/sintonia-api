/*
  Warnings:

  - You are about to drop the column `challenge` on the `ai_responses` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChallengeTypeAnswer" AS ENUM ('Unsuccessfully', 'Pending', 'Completed');

-- AlterTable
ALTER TABLE "ai_responses" DROP COLUMN "challenge";

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "answer" "ChallengeTypeAnswer" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
