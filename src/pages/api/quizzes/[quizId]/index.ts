import { GetQuiz } from "@/dtos/quiz";
import { prisma } from "@/lib/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetQuiz | string>
) {
  if (req.method !== "GET") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .send(ReasonPhrases.METHOD_NOT_ALLOWED);
  }

  const quizId = req.query.quizId ?? "";
  const result = z.uuid().safeParse(quizId);
  if (result.success === false) {
    console.error(new Error(result.error.message));
    return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      relationLoadStrategy: "join",
      select: {
        id: true,
        name: true,
        duration_in_sec: true,
        questions: {
          select: {
            question: {
              select: {
                id: true,
                content: true,
                solution: true,
                type: true,
                answers: {
                  select: {
                    id: true,
                    content: true,
                    is_correct: true,
                  },
                },
              },
            },
          },
        },
      },
      where: { id: result.data },
    });

    if (quiz === null) {
      return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
      id: quiz.id,
      name: quiz.name,
      duration_in_sec: quiz.duration_in_sec,
      questions: quiz.questions.map(({ question }) => {
        return {
          id: question.id,
          content: question.content,
          solution: question.solution,
          type: question.type,
          answers: question.answers,
        };
      }),
    });
  } catch (error) {
    console.error(new Error("failed to get quiz", { cause: error }));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
}
