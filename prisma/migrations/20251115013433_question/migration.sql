-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('multiple_choice', 'multiple_answer');

-- CreateTable
CREATE TABLE "question" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "type" "question_type" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);
