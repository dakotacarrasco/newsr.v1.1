export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    topics: string[];
    locations: string[];
    darkMode: boolean;
  };
}

export interface Article {
  id: string;
  title: string;
  content: string;
  description: string;
  category: string;
  author_id: string;
  published_at: string;
  image_url?: string;
  keywords: string[];
  views: number;
  likes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: Record<string, number>;
  category: string;
  end_date: string | null;
  created_at: string;
  total_votes: number;
}

export interface GetArticlesParams {
  sources?: string[];
  categories?: string[];
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
}

export interface PollVoteRequest {
  option: string;
}

export interface PollCreateRequest {
  question: string;
  options: Record<string, any>;
  category?: string;
  end_date?: string;
} 