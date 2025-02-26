/*
  Warnings:

  - Changed the type of `expiresAt` on the `couple_invites` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "couple_invites" DROP COLUMN "expiresAt",
ADD COLUMN     "expiresAt" INTEGER NOT NULL;
