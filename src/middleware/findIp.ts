import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      clientIP: string;
    }
  }
}

const getHeaderValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

const finfIpAddress = (req: Request, res: Response, next: NextFunction) => {
  // you get the ip address in the headers

  const forwardedFor = getHeaderValue(req.headers["x-forwarded-for"]);
  const realIP = getHeaderValue(req.headers["x-real-ip"]);
  const remoteAddress = req.socket.remoteAddress || "";

  const ip = forwardedFor || realIP || remoteAddress;
  req.clientIP = ip.split(",")[0].trim();

  next();
};

export default finfIpAddress;
