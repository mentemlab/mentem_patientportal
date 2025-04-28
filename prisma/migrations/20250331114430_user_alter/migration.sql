/*
  Warnings:

  - You are about to drop the column `iConcent` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "iConcent",
ADD COLUMN     "iConsent" BOOLEAN NOT NULL DEFAULT false;
