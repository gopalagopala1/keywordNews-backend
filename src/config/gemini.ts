import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY as string;
const geminiModel = process.env.GEMINI_MODEL as string;

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
  model: geminiModel,
  generationConfig: { responseMimeType: "application/json" },
});

export default model;
