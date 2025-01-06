import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import errorHandler from "./middleware/error";
import finfIpAddress from "./middleware/findIp";
import notFound from "./middleware/notFound";
import newsRouter from "./routes/news";
import { safeRequestLogger } from './middleware/logger.middleware'

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(safeRequestLogger);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/test", (req, res) => {
  res.send("Test World");
});

app.use("/news", finfIpAddress,  newsRouter);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
