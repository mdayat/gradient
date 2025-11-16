import { GetHistory } from "@/dtos/history";
import { prisma } from "@/lib/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetHistory | string>
) {
  if (req.method !== "GET") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .send(ReasonPhrases.METHOD_NOT_ALLOWED);
  }

  const historyId = req.query.historyId ?? "";
  const result = z.uuid().safeParse(historyId);
  if (result.success === false) {
    console.error(new Error(result.error.message));
    return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
  }

  try {
    const history = await prisma.user_quiz.findUnique({
      relationLoadStrategy: "join",
      select: {
        id: true,
        completed_at: true,
        quiz: {
          select: {
            id: true,
            name: true,
            duration_in_sec: true,
          },
        },
        user_responses: {
          select: {
            id: true,
            answer_id: true,
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

    if (history === null) {
      return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
    }

    const questionsMap = new Map<string, GetHistory["questions"][number]>();
    for (const item of history.user_responses) {
      let question = questionsMap.get(item.question.id);
      if (question === undefined) {
        question = {
          id: item.question.id,
          content: item.question.content,
          solution: item.question.solution,
          type: item.question.type,
          answers: item.question.answers,
          selectedAnswerIds: [],
        };
      }

      if (item.answer_id !== null) {
        question.selectedAnswerIds.push(item.answer_id);
      }
      questionsMap.set(item.question.id, question);
    }

    const totalQuestion = questionsMap.size;
    let totalCorrectQuestion = 0;

    const questions: GetHistory["questions"] = [];
    questionsMapLoop: for (const item of questionsMap.values()) {
      questions.push(item);
      if (item.selectedAnswerIds.length === 0) {
        continue;
      }

      if (item.selectedAnswerIds.length === 1) {
        for (const answer of item.answers) {
          if (item.selectedAnswerIds[0] !== answer.id) {
            continue;
          }

          if (answer.is_correct) {
            totalCorrectQuestion++;
            continue questionsMapLoop;
          }
        }
      }

      if (item.selectedAnswerIds.length > 1) {
        selectedAnswerIdsLoop: for (const answerId of item.selectedAnswerIds) {
          for (const answer of item.answers) {
            if (answerId !== answer.id) {
              continue;
            }

            if (answer.is_correct === false) {
              continue questionsMapLoop;
            }

            if (answer.is_correct) {
              continue selectedAnswerIdsLoop;
            }
          }
        }
        totalCorrectQuestion++;
      }
    }

    res.status(StatusCodes.OK).json({
      id: history.id,
      score: Math.round((totalCorrectQuestion / totalQuestion) * 100),
      completed_at: history.completed_at.toISOString(),
      quiz: history.quiz,
      questions,
    });
  } catch (error) {
    console.error(new Error("failed to get history", { cause: error }));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
}
