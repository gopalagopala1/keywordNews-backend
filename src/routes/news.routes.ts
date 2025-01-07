import express, { Request, Response, NextFunction } from "express";
import newsController from "../controllers/news.controller";

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await newsController.getNews(req, res, next);
  } catch (error) {
    next(error);
  }
});



export default router;
