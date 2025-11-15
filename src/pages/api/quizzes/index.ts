import { GetQuizzes } from "@/dtos/quiz";
import { prisma } from "@/lib/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetQuizzes | string>
) {
  if (req.method !== "GET") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .send(ReasonPhrases.METHOD_NOT_ALLOWED);
  }

  try {
    const quizzes = await prisma.quiz.findMany({
      relationLoadStrategy: "join",
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    res.status(StatusCodes.OK).json(
      quizzes.map((quiz) => ({
        id: quiz.id,
        name: quiz.name,
        duration_in_sec: quiz.duration_in_sec,
        question_count: quiz._count.questions,
        created_at: quiz.created_at.toISOString(),
      }))
    );
  } catch (error) {
    console.error(new Error("failed to get quizzes", { cause: error }));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
}
