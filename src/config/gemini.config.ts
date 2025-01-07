import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "./env.config";


const geminiApiKey = env.GEMINI_API_KEY as string;
const geminiModel = env.GEMINI_MODEL as string;

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
  model: geminiModel,
  generationConfig: { responseMimeType: "application/json" },
});

export default model;
