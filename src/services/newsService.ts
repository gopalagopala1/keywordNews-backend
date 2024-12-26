import dotenv from "dotenv";
import supabase from "../config/supabase";
import { NewsDataType, NewsPayload, NewsResponse } from "../types/newsTypes";
import geminiService from "./geminiService";

dotenv.config();

const getSystemLanguage = (): string => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  return locale.split("-")[0];
};

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
  const {
    includeKeywords,
    excludeKeywords,
    country,
    category,
    page,
    language,
  } = payload;
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("NEWS_API_KEY environment variable is not set");
  }

  const queryParams = new URLSearchParams({
    apikey: apiKey,
  });

  if (country) {
    queryParams.append("country", country);
  }

  if (category) {
    queryParams.append("category", category.toLowerCase());
  }

  if (page) {
    queryParams.append("page", page.toString());
  }

  const systemLanguage = getSystemLanguage();
  queryParams.append("language", language ?? systemLanguage);

  if (includeKeywords.length > 0 || excludeKeywords.length > 0) {
    const keywordsQuery = createKeywordsQuery(includeKeywords, excludeKeywords);
    queryParams.append("q", keywordsQuery);
  }

  queryParams.append("image", "1");
  queryParams.append("removeduplicate", "1");
  queryParams.append("prioritydomain", "top");

  return queryParams.toString();
};

const updateSentimentToData = (
  data: NewsDataType[],
  sentiments: {
    article_id: string;
    sentiment: "Positive" | "Negative" | "Neutral";
  }[]
) => {
  return data.map((article) => {
    const sentiment = sentiments.find(
      (sentiment) => sentiment.article_id === article.article_id
    );

    return {
      ...article,
      sentiment: sentiment?.sentiment ?? "Neutral",
    };
  });
};

const cacheResponse = async (data: NewsResponse) => {
  const date = new Date().toISOString().slice(0, 10);

  try {
    const sentiments = (await geminiService.getSentiment(data.results)) ?? [];
    const mergedData = updateSentimentToData(data.results, sentiments);

    const { data: existingCache } = await supabase
      .from("cache_data")
      .select("results")
      .eq("date", date)
      .single();

    if (!existingCache) {
      const { error: insertError } = await supabase.from("cache_data").insert({
        date,
        results: mergedData,
        next_page: data.nextPage?.toString() ?? "",
      });

      if (insertError) throw insertError;
      return true;
    }

    const existingData = existingCache.results ?? [];

    const combinedResults = [...existingData, ...mergedData];

    // Create a Map to ensure unique articles by article_id
    const uniqueResultsMap = new Map<string, any>();
    combinedResults.forEach((article) => {
      uniqueResultsMap.set(article.article_id, article);
    });

    // Convert the Map back to an array
    const uniqueResults = Array.from(uniqueResultsMap.values());

    const { error: updateError } = await supabase
      .from("cache_data")
      .update({
        results: uniqueResults,
        next_page: data.nextPage?.toString() ?? "",
      })
      .eq("date", date);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error("Cache operation failed:", error);
    return null;
  }
};

const fetchCachedResponse = async () => {
  const date = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("cache_data")
    .select("results, next_page")
    .eq("date", date)
    .single();

  const results = data?.results ?? [];
  
  if (error) {
    console.error("Error fetching cached response:", error);
    return null;
  }

  return { results, nextPage: Number(data?.next_page), status: "ok" };
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

    // if (!response.ok) {
    return await fetchCachedResponse();
    // }

    const data: NewsResponse = await response.json();

    cacheResponse(data);
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
