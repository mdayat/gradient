-- CreateTable
CREATE TABLE "user_quiz" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_response" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_quiz_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "answer_id" UUID,

    CONSTRAINT "user_response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_quiz_user_id_quiz_id_key" ON "user_quiz"("user_id", "quiz_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_response_question_id_answer_id_key" ON "user_response"("question_id", "answer_id");

-- AddForeignKey
ALTER TABLE "user_quiz" ADD CONSTRAINT "user_quiz_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz" ADD CONSTRAINT "user_quiz_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_response" ADD CONSTRAINT "user_response_user_quiz_id_fkey" FOREIGN KEY ("user_quiz_id") REFERENCES "user_quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_response" ADD CONSTRAINT "user_response_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_response" ADD CONSTRAINT "user_response_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
