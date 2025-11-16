import type { NextApiRequest, NextApiResponse } from "next";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import z from "zod";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method !== "POST") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .send(ReasonPhrases.METHOD_NOT_ALLOWED);
  }

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
    return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
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

    res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED);
  } catch (error) {
    console.error(new Error("failed to create user quiz", { cause: error }));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
}
