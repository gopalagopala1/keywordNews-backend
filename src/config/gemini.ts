import {GoogleGenerativeAI} from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const geminiApiKey = process.env.GEMINI_API_KEY as string;
const geminiModel = process.env.GEMINI_MODEL as string;

const genAI = new GoogleGenerativeAI(geminiApiKey)
const modal = genAI.getGenerativeModel({model: geminiModel})

export default modal;