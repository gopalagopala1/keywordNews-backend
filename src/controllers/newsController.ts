import { NextFunction, Request, Response } from "express";
import newsService from "../services/newsService";
import { NewsPayload } from "../types/newsTypes";

const getNews = async (req: Request, res: Response, next: NextFunction) => {
  const defaultPayload: NewsPayload = {
    includeKeywords: [],
    excludeKeywords: [],
    country: "", // how to get country based on user location 
    category: "world",
    language: "en",
    page: 0,
    isHappy: false,
  };

  try {
    const ip = req.clientIP;
    const payload: NewsPayload = { ...defaultPayload, ...req.body };
    const news = await newsService.getNews(payload, ip);
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
