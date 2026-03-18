export type ClassificationLabel = 'good' | 'bad';

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timestamp: number;
  body?: string;
  classification: ClassificationLabel;
  confidence: number;
  topic: string;
  url?: string;
  imageUrl?: string;
  imageAlt?: string;
  sourceCountry?: string;
  publishDate?: string;
}

export interface Topic {
  id: string;
  name: string;
  articleCount: number;
  goodNewsPercentage: number;
  showGoodNews: boolean;
  showBadNews: boolean;
}

export interface ClassificationStats {
  totalArticles: number;
  goodCount: number;
  badCount: number;
  avgConfidence: number;
  reassignmentCount: number;
}

export interface AppSettings {
  goodKeywords: string[];
  badKeywords: string[];
  apiKey: string;
  learningRate: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface NewsFilters {
  countries: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}
