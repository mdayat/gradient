-- CreateTable
CREATE TABLE "quiz_question" (
    "quiz_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,

    CONSTRAINT "quiz_question_pkey" PRIMARY KEY ("quiz_id","question_id")
);

-- AddForeignKey
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
