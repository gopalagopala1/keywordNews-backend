import { Logger } from 'winston';
import { Request, Response } from 'express';

export interface CustomLogger extends Logger {
  startRequest: (req: Request) => void;
  endRequest: (req: Request, res: Response, responseTime: number) => void;
}

export type ErrorLevelType =
  | "error"
  | "warn"
  | "info"
  | "http"
  | "debug";
