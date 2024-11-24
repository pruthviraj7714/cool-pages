import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { config } from "dotenv"
config()

interface CustomRequest extends Request {
  userId?: string;
}

export default function authMiddleware(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) : any {
  const headers = req.headers["authorization"];

  const token = headers?.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      message: "Bearer token is missing",
    });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET ?? "") as JwtPayload;
    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }
}
