-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isCredentialsLogin" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "chattedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
