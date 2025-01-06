import cors from "cors";
import express from "express";
import env from "./config/env.config";
import logger from "./config/logger.config";
import errorHandler from "./middleware/error";
import findIpAddress from "./middleware/findIp";
import { safeRequestLogger } from './middleware/logger.middleware';
import notFound from "./middleware/notFound";
import newsRouter from "./routes/news";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(safeRequestLogger);

// Basic routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/test", (req, res) => {
  res.send("Test World");
});

// API routes
app.use("/news", findIpAddress, newsRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server (only in non-production environment)
if (env.NODE_ENV !== 'production') {
  app.listen(env.PORT, () => {
    logger.info(`Server started`, {
      port: env.PORT,
      environment: env.NODE_ENV,
    });
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { 
    error: error.message,
    stack: error.stack 
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', { reason });
  process.exit(1);
});

export default app;