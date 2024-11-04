import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import errorHandler from "./middleware/error";
import notFound from "./middleware/notFound";
import newsRouter from "./routes/news";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use(errorHandler);

app.use("/news", newsRouter);
app.use(notFound);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});
