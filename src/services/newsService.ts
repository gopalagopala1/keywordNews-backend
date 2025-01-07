import env from "../config/env.config";
import supabase from "../config/supabase.config";
import { NewsDataType, NewsPayload, NewsResponse } from "../types/news.types";
import { errorMessages, isPrivateOrLocalIP } from "../utils/general.utils";
import geminiService from "./geminiService";
import geoip from "geoip-lite";

const getSystemLanguage = (): string => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  return locale.split("-")[0];
};

// const getCountry = (ip: string) => {
//   if (isPrivateOrLocalIP(ip)) {
//     return "";
//   }

//   const geoData = geoip.lookup(ip);

//   if (!geoData) {
//     return "";
//   }

//   return geoData.country;
// };

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

const constructQuery = (payload: NewsPayload, ip: string) => {
  const {
    includeKeywords,
    excludeKeywords,
    country,
    category,
    page,
    language,
  } = payload;
  const apiKey = env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("NEWS_API_KEY environment variable is not set");
  }

  const queryParams = new URLSearchParams({
    apikey: apiKey,
  });

  // const systemCountry = getCountry(ip);
  // const userCountry = country || systemCountry;
  // console.log("userCountry", userCountry);
  // queryParams.append("country", userCountry);

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
  const languageCode = language || systemLanguage;
  queryParams.append("language", languageCode);

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

  return {
    results,
    nextPage: Number(data?.next_page),
    status: "ok",
    errorMessage: errorMessages["cached_response"],
  };
};

const fetchHappyNews = async () => {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().slice(0, 10);
  });

  const allResults = [];
  let nextPage = null;

  for (const date of dates) {
    const { data, error } = await supabase
      .from("cache_data")
      .select("results, next_page")
      .eq("date", date)
      .single();

    if (error) {
      console.error(`Error fetching data for ${date}:`, error);
      continue;
    }

    if (data?.results) {
      const positiveNews = data.results.filter(
        (article: NewsDataType) => article.sentiment === "Positive"
      );
      allResults.push(...positiveNews);
    }

    // Store the next_page from most recent date only
    if (date === dates[0] && data?.next_page) {
      nextPage = Number(data.next_page);
    }
  }

  return {
    results: allResults,
    nextPage,
    status: allResults.length > 0 ? "ok" : "no_results",
  };
};

const getNews = async (payload: NewsPayload, ip: string) => {
  try {
    const isHappy = payload.isHappy;

    if (isHappy) {
      return await fetchHappyNews();
    }

    const query = constructQuery(payload, ip);
    const url = `${process.env.NEWS_API_URL}/latest?${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return await fetchCachedResponse();
    }

    const data: NewsResponse = await response.json();

    if (data.results.length === 0) {
      const cachedResponse = await fetchCachedResponse();
      return { ...cachedResponse, errorMessage: errorMessages["no_results"] };
    }

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
