import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

const DEFAULT_ERR_MESSAGE = "An error happened";

export default function globalErrorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  err.code = err.code || 500;
  err.message = err.message || DEFAULT_ERR_MESSAGE;

  if (!err.isOperational) {
    console.error("\x1b[31m%s\x1b[0m", "-----ERROR-----");
    console.error(err);
    console.error("\x1b[31m%s\x1b[0m", "-----END ERROR-----");
  }

  return res.status(err.code).json({
    message: err.message,
  });
}
