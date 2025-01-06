import winston from 'winston';
import { Request, Response } from 'express';
import { CustomLogger, ErrorLevelType } from '../types/logger.types';

// Define custom levels
const levels: Record<ErrorLevelType, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define level colors
const colors: Record<ErrorLevelType, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

// Tell winston about our colors
winston.addColors(colors);

// Create the logger with console transport only for serverless environment
const logger = winston.createLogger({
  levels: levels,
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}${
        info.splat !== undefined ? `${info.splat}` : ' '
      }${
        typeof info.metadata === 'object' ? JSON.stringify(info.metadata) : ''
      }`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      )
    })
  ]
}) as CustomLogger;

// Add custom methods to the logger
logger.startRequest = (req: Request) => {
  logger.info(`Incoming ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    query: req.query,
    params: req.params
  });
};

logger.endRequest = (req: Request, res: Response, responseTime: number) => {
  logger.info(`Response sent: ${res.statusCode}`, {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime
  });
};

export default logger;