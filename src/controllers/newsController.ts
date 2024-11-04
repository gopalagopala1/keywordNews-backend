import { NextFunction, Request, Response } from "express";
import newsService from "../services/newsService";
import { NewsPayload } from "../types/newsTypes";

const getNews = async (req: Request, res: Response, next: NextFunction) => {
  const defaultPayload: NewsPayload = {
    includeKeywords: [],
    excludeKeywords: [],
    country: "", // how to get country based on user location 
    category: "world",
    page: 0,
  };

  try {
    const payload: NewsPayload = { ...defaultPayload, ...req.body };
    const news = await newsService.getNews(payload);
    return (res.status(200)).json(news);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const newsController = {
  getNews,
};

export default newsController;
