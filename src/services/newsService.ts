import { NewsItem } from '../types';

const RSS_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  'https://www.wired.com/feed/rss',
  'https://feeds.arstechnica.com/arstechnica/index'
];

export const newsService = {
  getTopNews: async (): Promise<NewsItem[]> => {
    try {
      const fetchPromises = RSS_FEEDS.map(async (feedUrl) => {
        try {
          const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
          const data = await response.json();
          if (data.status !== 'ok') return [];
          
          return data.items.map((item: any) => ({
            id: item.guid,
            title: item.title,
            summary: item.description.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
            source: item.author || data.feed.title,
            url: item.link,
            publishedAt: item.pubDate,
            category: item.categories?.[0] || 'Tech'
          }));
        } catch (e) {
          console.error(`Error fetching ${feedUrl}:`, e);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      const allNews = results.flat();
      
      // Sort by date descending
      return allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } catch (error) {
      console.error('Error aggregating news:', error);
      return [];
    }
  }
};
