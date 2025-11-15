import type { NextApiRequest, NextApiResponse } from "next";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
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

  res.setHeader(
    "Set-Cookie",
    "user_id=; Max-Age=0; Path=/api; SameSite=Strict; HttpOnly; Secure;"
  );
  res.status(StatusCodes.NO_CONTENT).send(ReasonPhrases.NO_CONTENT);
}
