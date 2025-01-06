import winston from "winston";
import path from "path";
import { ErrorLevelType } from "../types/types";

const levels: Record<ErrorLevelType, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  trace: 5,
};

const colors: Record<ErrorLevelType, string> = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
  trace: "orange",
};

winston.addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "warn";
};

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${
        info.splat !== undefined ? `${info.splat}` : " "
      }${info.metadata ? JSON.stringify(info.metadata) : ""}`
  )
);

// where and how the log files are stored and used
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    ),
  }),
  // Error log file transport
  new winston.transports.File({
    filename: path.join("logs", "error.log"),
    level: "error",
    format,
  }),
  // All logs file transport
  new winston.transports.File({
    filename: path.join("logs", "combined.log"),
    format,
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
