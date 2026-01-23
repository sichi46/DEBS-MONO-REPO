import { Response } from "express";
import { ApiResponse } from "../types/index.js";

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  error: string,
  statusCode = 400
): Response {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res.status(statusCode).json(response);
}

export function sendValidationError(
  res: Response,
  errors: { field: string; message: string }[]
): Response {
  return res.status(400).json({
    success: false,
    error: "Validation failed",
    details: errors,
  });
}
