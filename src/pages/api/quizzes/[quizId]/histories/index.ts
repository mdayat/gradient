import type { NextApiRequest, NextApiResponse } from "next";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { GetQuizHistories } from "@/dtos/history";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetQuizHistories | string>
) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .send(ReasonPhrases.METHOD_NOT_ALLOWED);
  }

  if (req.method === "POST") {
    const quizId = req.query.quizId ?? "";
    const quizIdResult = z.uuid().safeParse(quizId);
    if (quizIdResult.success === false) {
      console.error(new Error(quizIdResult.error.message));
      return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
    }

    const bodyrResult = z
      .object({
        user_id: z.uuid(),
        user_responses: z
          .object({ question_id: z.uuid(), answer_id: z.uuid().nullable() })
          .array(),
      })
      .safeParse(req.body);

    if (bodyrResult.success === false) {
      console.error(new Error(bodyrResult.error.message));
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(ReasonPhrases.BAD_REQUEST);
    }

    try {
      await prisma.$transaction(async (tx) => {
        const userQuiz = await tx.user_quiz.create({
          data: {
            quiz_id: quizIdResult.data,
            user_id: bodyrResult.data.user_id,
          },
        });

        const insertedRows = await tx.user_response.createMany({
          data: bodyrResult.data.user_responses.map((item) => ({
            user_quiz_id: userQuiz.id,
            question_id: item.question_id,
            answer_id: item.answer_id,
          })),
        });

        if (insertedRows.count !== bodyrResult.data.user_responses.length) {
          throw new Error(
            `inserted rows mismatch: expected ${bodyrResult.data.user_responses.length}, got ${insertedRows.count}`
          );
        }
      });

      return res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED);
    } catch (error) {
      console.error(new Error("failed to create user quiz", { cause: error }));
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
  }

  if (req.method === "GET") {
    const userId = req.cookies.user_id ?? "";
    const userIdResult = z.uuid().safeParse(userId);
    if (userIdResult.success === false) {
      console.error(new Error(userIdResult.error.message));
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(ReasonPhrases.UNAUTHORIZED);
    }

    const quizId = req.query.quizId ?? "";
    const quizIdResult = z.uuid().safeParse(quizId);
    if (quizIdResult.success === false) {
      console.error(new Error(quizIdResult.error.message));
      return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
    }

    try {
      const quizHistories = await prisma.$transaction(
        async (tx): Promise<GetQuizHistories | null> => {
          const [quiz, histories] = await Promise.all([
            tx.quiz.findUnique({
              select: { id: true, name: true, duration_in_sec: true },
              where: { id: quizIdResult.data },
            }),
            tx.user_quiz.findMany({
              select: { id: true, completed_at: true },
              where: { user_id: userIdResult.data, quiz_id: quizIdResult.data },
              orderBy: { completed_at: "desc" },
            }),
          ]);

          if (quiz === null) {
            return null;
          }

          return {
            id: quiz.id,
            name: quiz.name,
            duration_in_sec: quiz.duration_in_sec,
            histories: histories.map((history) => ({
              id: history.id,
              completed_at: history.completed_at.toISOString(),
            })),
          };
        }
      );

      if (quizHistories === null) {
        return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
      }

      return res.status(StatusCodes.OK).json(quizHistories);
    } catch (error) {
      console.error(
        new Error("failed to get quiz histories", { cause: error })
      );
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
  }
}
