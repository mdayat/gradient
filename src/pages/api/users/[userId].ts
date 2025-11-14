import { User } from "@/dtos/user";
import { prisma } from "@/lib/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  if (req.method !== "GET") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .send(ReasonPhrases.METHOD_NOT_ALLOWED);
  }

  const userId = (req.query.userId ?? "") as string;
  const result = z.uuid().safeParse(userId);
  if (result.success === false) {
    return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
  }

  try {
    const user = await prisma.user.findUnique({
      select: { id: true, email: true, created_at: true },
      where: { id: userId },
    });

    if (user === null) {
      return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
      id: user.id,
      email: user.email,
      created_at: user.created_at.toISOString(),
    });
  } catch (error) {
    console.error(new Error("failed to get user", { cause: error }));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
}
