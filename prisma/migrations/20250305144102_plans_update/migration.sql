-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionStatus" TEXT,
ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL;
