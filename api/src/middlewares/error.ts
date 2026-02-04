import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  try {
    const { method, url } = req;
    const status: number = error.status || 500;
    const message: string = error.message || "Something went wrong";

    console.error(
      `[ERROR] >> ${method.toUpperCase()}: ${url} >> ${status}: ${message}`,
    );

    return res.status(status).json({
      error: message,
      status: status,
    });
  } catch (err) {
    next(err);
  }
};
