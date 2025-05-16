export interface PoliticalArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  author?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isAiGenerated: boolean;
  originalContent?: string; // For storing the original content before AI rewriting
  tags?: string[];
  category?: string;
}

export interface PoliticalPoll {
  id: string;
  title: string;
  description: string;
  options: PoliticalPollOption[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  totalVotes: number;
}

export interface PoliticalPollOption {
  id: string;
  text: string;
  votes: number;
} 