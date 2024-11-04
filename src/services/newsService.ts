import { NewsPayload } from "../types/newsTypes";
import dotenv from "dotenv";

dotenv.config();

const createKeywordsQuery = (
  includeKeywords: string[],
  excludeKeywords: string[]
) => {



  let includeQuery = includeKeywords
    .map((keyword) => `"${keyword}"`)
    .join(" OR ");

  if (includeQuery) {
    includeQuery = `( ${includeQuery} )`;
  }

  let excludeQuery = excludeKeywords
    .map((keyword) => `${keyword}`)
    .join(" AND ");

  if (excludeQuery) {
    excludeQuery = `NOT ( ${excludeQuery} )`;
  }

  return `${includeQuery} ${excludeQuery}`;
};

const constructQuery = (payload: NewsPayload) => {
  const { includeKeywords, excludeKeywords, country, category, page } = payload;
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error('NEWS_API_KEY environment variable is not set');
  }

  const queryParams = new URLSearchParams({
    apikey: apiKey
  });

  if (country) {
    queryParams.append('country', country);
  }

  if (category) {
    queryParams.append('category', category.toLowerCase());
  }

  if (page) {
    queryParams.append('page', page.toString());
  }

  if (includeKeywords.length > 0 || excludeKeywords.length > 0) {
    const keywordsQuery = createKeywordsQuery(includeKeywords, excludeKeywords);
    queryParams.append('q', keywordsQuery);
  }

  console.log('queryParams: ', queryParams.toString());

  return queryParams.toString();
};

const getNews = async (payload: NewsPayload) => {
  try {
    const query = constructQuery(payload);
    const url = `${process.env.NEWS_API_URL}/latest?${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const newsService = {
  getNews,
};

export default newsService;
