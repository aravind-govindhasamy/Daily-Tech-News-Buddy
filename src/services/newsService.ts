import { NewsItem } from '../types';

const RSS_FEEDS = [
  // General Tech
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  'https://venturebeat.com/feed/',
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://www.wired.com/feed/rss',
  'https://www.engadget.com/rss.xml',
  // Developer & Languages
  'https://dev.to/feed',
  'https://www.freecodecamp.org/news/rss/',
  'https://feed.infoq.com/',
  'https://www.smashingmagazine.com/feed/',
  'https://www.reddit.com/r/programming/.rss',
  // GitHub & Trending
  'https://github.blog/feed/',
  'https://hnrss.org/frontpage',
  // IoT & Emerging Tech
  'https://readwrite.com/feed/',
  'https://feeds.feedburner.com/zdnet/latest'
];

const MONEY_FEEDS = [
  'https://www.sidehustlenation.com/feed/',
  'https://thepennyhoarder.com/feed/',
  'https://www.makingsenseofcents.com/feed',
  'https://www.smartpassiveincome.com/feed/',
  'https://sidehustleschool.com/feed/',
  'https://www.nerdwallet.com/blog/feed/',
  'https://www.mrmoneymustache.com/feed/',
  'https://www.reddit.com/r/sidehustle/.rss',
  'https://www.reddit.com/r/Frugal/.rss',
  'https://www.reddit.com/r/personalfinance/.rss'
];

const CYBER_FEEDS = [
  'https://www.bleepingcomputer.com/feed/',
  'https://krebsonsecurity.com/feed/',
  'https://thehackernews.com/feeds/posts/default',
  'https://www.darkreading.com/rss.xml',
  'https://www.infosecurity-magazine.com/rss/news/',
  'https://nakedsecurity.sophos.com/feed/',
  'https://www.securityweek.com/rss',
  'https://www.helpnetsecurity.com/feed/',
  'https://www.cisa.gov/cybersecurity-alerts/alerts.xml',
  'https://www.fbi.gov/feeds/cyber-news/rss.xml'
];

const DEALS_FEEDS = [
  'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1',
  'https://www.reddit.com/r/freebies/.rss',
  'https://www.reddit.com/r/coupons/.rss',
  'https://www.reddit.com/r/giveaways/.rss',
  'https://www.reddit.com/r/deals/.rss'
];

const COMPETITION_FEEDS = [
  'https://www.reddit.com/r/hackathon/.rss',
  'https://www.reddit.com/r/hackathons/.rss',
  'https://www.reddit.com/r/gamejams/.rss',
  'https://itch.io/jams.xml',
  'https://www.reddit.com/r/programmingcontests/.rss'
];

const GOVT_SCHEMES_FEEDS = [
  'https://news.google.com/rss/search?q=intitle:scheme+OR+intitle:yojana+OR+intitle:subsidy+%22Tamil+Nadu%22+-election+-politics+-campaign&hl=en-IN&gl=IN&ceid=IN:en',
  'https://news.google.com/rss/search?q=intitle:scheme+OR+intitle:yojana+OR+intitle:subsidy+%22India%22+-election+-politics+-campaign&hl=en-IN&gl=IN&ceid=IN:en',
  'https://news.google.com/rss/search?q=%22apply+online%22+(scheme+OR+yojana+OR+subsidy)+India+-election+-politics&hl=en-IN&gl=IN&ceid=IN:en'
];

const getFallbackCategory = (url: string): string => {
  const u = url.toLowerCase();
  if (u.includes('github.blog')) return 'GitHub';
  if (u.includes('hnrss.org')) return 'Trending';
  if (u.includes('dev.to') || u.includes('freecodecamp') || u.includes('infoq') || u.includes('smashingmagazine') || u.includes('programming')) return 'Development';
  if (u.includes('readwrite')) return 'IoT';
  if (u.includes('sidehustle')) return 'Side Hustle';
  if (u.includes('frugal') || u.includes('pennyhoarder') || u.includes('mrmoneymustache')) return 'Save Money';
  if (u.includes('makingsenseofcents') || u.includes('smartpassiveincome') || u.includes('nerdwallet') || u.includes('personalfinance')) return 'Money';
  if (u.includes('bleepingcomputer') || u.includes('krebsonsecurity') || u.includes('thehackernews') || u.includes('darkreading') || u.includes('infosecurity') || u.includes('nakedsecurity') || u.includes('securityweek') || u.includes('helpnetsecurity') || u.includes('cisa') || u.includes('fbi')) return 'Cyber Crime';
  if (u.includes('freebies') || u.includes('giveaways')) return 'Giveaway';
  if (u.includes('coupons') || u.includes('slickdeals') || u.includes('deals')) return 'Deal';
  if (u.includes('hackathon') || u.includes('programmingcontests')) return 'Hackathon';
  if (u.includes('gamejams') || u.includes('itch.io')) return 'Game Jam';
  if (u.includes('google.com/rss/search?q=intitle:scheme') && u.includes('tamil+nadu')) return 'TN Govt Scheme';
  if (u.includes('google.com/rss/search?q=intitle:scheme') && u.includes('india')) return 'Indian Govt Scheme';
  return 'Tech';
};

const fetchAndParseFeeds = async (feeds: string[]): Promise<NewsItem[]> => {
  try {
    const fetchPromises = feeds.map(async (feedUrl) => {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
        const data = await response.json();
        if (data.status !== 'ok') return [];
        
        return data.items.map((item: any) => ({
          id: item.guid || item.link,
          title: item.title,
          summary: item.description.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
          source: item.author || data.feed.title || 'News Source',
          url: item.link,
          publishedAt: item.pubDate,
          category: item.categories?.[0] || getFallbackCategory(feedUrl)
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
};

export const newsService = {
  getTopNews: async (): Promise<NewsItem[]> => {
    return fetchAndParseFeeds(RSS_FEEDS);
  },
  getMoneyNews: async (): Promise<NewsItem[]> => {
    return fetchAndParseFeeds(MONEY_FEEDS);
  },
  getCyberNews: async (): Promise<NewsItem[]> => {
    return fetchAndParseFeeds(CYBER_FEEDS);
  },
  getDealsNews: async (): Promise<NewsItem[]> => {
    return fetchAndParseFeeds(DEALS_FEEDS);
  },
  getCompetitionNews: async (): Promise<NewsItem[]> => {
    return fetchAndParseFeeds(COMPETITION_FEEDS);
  },
  getGovtSchemesNews: async (): Promise<NewsItem[]> => {
    const news = await fetchAndParseFeeds(GOVT_SCHEMES_FEEDS);
    // Extra client-side filter to ensure no political/election news slips through
    const excludeWords = ['election', 'elections', 'polls', 'campaign', 'voting', 'mla', 'mp', 'political', 'politics'];
    return news.filter(item => {
      const text = (item.title + ' ' + item.summary).toLowerCase();
      // Check for exact word matches to avoid filtering words like 'pollution'
      return !excludeWords.some(word => new RegExp(`\\b${word}\\b`).test(text));
    });
  }
};

