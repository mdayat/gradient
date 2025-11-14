import type { NextApiRequest, NextApiResponse } from "next";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { User } from "@/dtos/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  if (req.method !== "POST") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .send(ReasonPhrases.METHOD_NOT_ALLOWED);
  }

  const result = z
    .object({ email: z.email(), password: z.string() })
    .safeParse(req.body);

  if (result.success === false) {
    console.error(new Error(result.error.message));
    return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
  }

  try {
    const user = await prisma.user.findUnique({
      select: { id: true, email: true, created_at: true },
      where: { email: result.data.email, password: result.data.password },
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
    console.error(new Error("failed to sign-in", { cause: error }));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
}
