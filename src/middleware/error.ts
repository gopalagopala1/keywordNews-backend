import { NextFunction, Request, Response } from "express";


 const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    message,
  });
};

export default errorHandler;
    