export type NewsPayload = {
    includeKeywords: string[];
    excludeKeywords: string[];
    country: string;
    category: string;
    language: string;
    page: number;
    isHappy: boolean;
}

export type NewsDataType = {
    article_id: string;
    title: string;
    link: string;
    keywords: string[] | null;
    creator: string | null;
    video_url: string | null;
    description: string;
    content: string;
    pubDate: string;
    pubDateTZ: string;
    image_url: string;
    source_id: string;
    source_priority: number;
    source_name: string;
    source_url: string;
    source_icon: string;
    language: string;
    country: string[];
    category: string[];
    ai_tag: string;
    sentiment: string;
    sentiment_stats: string;
    ai_region: string;
    ai_org: string;
    duplicate: boolean;
  };

  export type NewsResponse = {
    status: string;
    results: NewsDataType[];
    nextPage: number;
    errorMessage: string;
  }
