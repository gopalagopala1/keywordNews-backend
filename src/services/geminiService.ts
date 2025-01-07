import model from "../config/gemini.config";
import { NewsDataType, NewsResponse } from "../types/news.types";

const createPrompt = (data: NewsDataType[]) => {
  const role = `You are an AI trained to analyze news articles and determine their sentiment. I will provide you with some news articles separated by #__#. Each article contains the following fields:
                    article_id: A unique identifier for the article.
                    title: The headline or title of the article.
                    description: A brief summary or description of the article.
                Your task is to assess the sentiment of each article based on its title and description. Classify the sentiment into one of the following categories:
                    Positive: The article conveys uplifting, optimistic, or good news.
                    Negative: The article conveys sad, worrisome, or pessimistic news.
                    Neutral: The article does not lean toward positive or negative sentiment; it is objective or factual.
                Return response in JSON format with the following structure:
                [{article_id: 1, sentiment: "Positive"}, {article_id: 2, sentiment: "Negative"}, ...]`;

  const dataPrompt = data.reduce((acc, curr) => {
    const { article_id, title, description } = curr;
    acc += `${article_id}: ${title}. ${description}#__#`;

    return acc;
  }, "");

  return role + dataPrompt;
};

const getSentiment = async (
  data: NewsDataType[]
): Promise<
  | {
      article_id: string;
      sentiment: "Positive" | "Negative" | "Neutral";
    }[]
  | null
> => {
  try {
    const prompt = createPrompt(data);
    const result = await model.generateContent(prompt);

    const responseText = result.response.text();
    const parsedResult = JSON.parse(responseText);
    return parsedResult.articles;
  } catch (error) {
    console.error("Error generating sentiment:", error);
    return null;
  }
};

const geminiService = {
  createPrompt,
  getSentiment,
};

export default geminiService;
