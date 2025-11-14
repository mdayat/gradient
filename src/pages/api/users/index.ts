import type { NextApiRequest, NextApiResponse } from "next";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { User } from "@/dtos/user";
import { Prisma } from "../../../../generated/prisma/client";

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
    return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
  }

  try {
    const user = await prisma.user.create({
      data: { email: result.data.email, password: result.data.password },
    });

    res.status(StatusCodes.CREATED).json({
      id: user.id,
      email: user.email,
      created_at: user.created_at.toISOString(),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      console.error(new Error("email already registered", { cause: error }));
      res.status(StatusCodes.CONFLICT).send(ReasonPhrases.CONFLICT);
    } else {
      console.error(new Error("failed to create user", { cause: error }));
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
  }
}
