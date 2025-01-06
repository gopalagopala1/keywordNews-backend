import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.config";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.http(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks: Buffer[] = [];

  res.write = function (chunk: any, encoding?: any, callback?: any): boolean {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    } else if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk, encoding));
    }
    return oldWrite.apply(res, arguments as any);
  };

  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    if (chunk) {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk, encoding));
      }
    }

    const responseBody = Buffer.concat(chunks).toString("utf8");

    logger.http(`Response: ${res.statusCode}`, {
      statusCode: res.statusCode,
      responseTime: Date.now() - req.socket.bytesRead,
      headers: res.getHeaders(),
      body: responseBody.substring(0, 1024), // Limit logged response size
    });

    return oldEnd.apply(res, arguments as any);
  };

  next();
};

interface ResponseBody {
  [key: string]: any;
}

export const safeRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requestLogger(req, res, next);
  } catch (error) {
    console.log('error: ', error)
    logger.error("Error in request logger middleware:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    next();
  }
};
