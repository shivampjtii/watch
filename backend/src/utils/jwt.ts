import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

interface JwtPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    env.jwtSecret,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    env.jwtSecret
  ) as JwtPayload;
};