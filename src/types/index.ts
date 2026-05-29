export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
}

export type PostTone = 'professional' | 'casual' | 'founder' | 'developer';

export interface GeneratedPost {
  id: string;
  newsId: string;
  newsTitle: string;
  newsUrl?: string;
  linkedin: string;
  originalLinkedin?: string;
  twitter: string;
  thread?: string[];
  imagePrompt?: string;
  imageUrl?: string;
  tone: PostTone;
  createdAt: string;
}

export interface ScheduledPost {
  id: string;
  postId: string;
  content: string;
  platform: 'linkedin' | 'twitter';
  scheduledFor: string;
  status: 'pending' | 'posted' | 'failed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
