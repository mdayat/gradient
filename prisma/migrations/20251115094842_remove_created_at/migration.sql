/*
  Warnings:

  - You are about to drop the column `created_at` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `quiz` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "question" DROP COLUMN "created_at";

-- AlterTable
ALTER TABLE "quiz" DROP COLUMN "created_at";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "created_at";

-- CreateTable
CREATE TABLE "answer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
