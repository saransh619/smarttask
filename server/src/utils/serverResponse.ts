import type { Response } from "express";
import { HttpStatus, ServerErrors } from "./constants.js";

type ResponseBody<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors?: unknown;
};

function send<T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: T | null = null,
  errors?: unknown,
) {
  const body: ResponseBody<T> = {
    success,
    statusCode,
    message,
    data,
  };

  if (errors) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
}

export const serverResponse = {
  success: <T>(res: Response, message: string, data?: T) =>
    send(res, HttpStatus.OK, true, message, data ?? null),

  created: <T>(res: Response, message: string, data?: T) =>
    send(res, HttpStatus.CREATED, true, message, data ?? null),

  badRequest: (res: Response, message: string, errors?: unknown) =>
    send(res, HttpStatus.BAD_REQUEST, false, message, null, errors),

  unauthorized: (res: Response, message: string = ServerErrors.UNAUTHORIZED) =>
    send(res, HttpStatus.UNAUTHORIZED, false, message),

  forbidden: (res: Response, message: string = ServerErrors.FORBIDDEN) =>
    send(res, HttpStatus.FORBIDDEN, false, message),

  notFound: (res: Response, message: string = ServerErrors.RESOURCE_NOT_FOUND) =>
    send(res, HttpStatus.NOT_FOUND, false, message),

  conflict: (res: Response, message: string) =>
    send(res, HttpStatus.CONFLICT, false, message),

  tooManyRequests: (res: Response, message: string) =>
    send(res, HttpStatus.TOO_MANY_REQUESTS, false, message),

  error: (res: Response, message: string = ServerErrors.INTERNAL_SERVER_ERROR) =>
    send(res, HttpStatus.INTERNAL_SERVER_ERROR, false, message),
};
