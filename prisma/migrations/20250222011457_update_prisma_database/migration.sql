-- CreateTable
CREATE TABLE "_CoupleUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoupleUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CoupleUsers_B_index" ON "_CoupleUsers"("B");

-- AddForeignKey
ALTER TABLE "_CoupleUsers" ADD CONSTRAINT "_CoupleUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoupleUsers" ADD CONSTRAINT "_CoupleUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
