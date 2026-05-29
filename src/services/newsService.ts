import { NewsItem } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

const IOT_FEEDS = [
  'https://iotbusinessnews.com/feed/',
  'https://www.electronicdesign.com/rss.xml',
  'https://www.embedded.com/feed/',
  'https://blog.arduino.cc/feed/'
];

const STARTUP_FEEDS = [
  'https://inc42.com/feed/',
  'https://yourstory.com/feed',
  'https://www.vccircle.com/feed',
  'https://techcrunch.com/category/startups/feed/'
];

const OPEN_SOURCE_FEEDS = [
  'https://github.blog/category/open-source/feed/',
  'https://www.phoronix.com/rss.php',
  'https://itsfoss.com/rss/',
  'https://hnrss.org/newest?q=open+source'
];

const AI_ENTERPRISE_FEEDS = [
  'https://www.artificialintelligence-news.com/feed/',
  'https://aibusiness.com/rss.xml',
  'https://www.technologyreview.com/topic/artificial-intelligence/feed',
  'https://news.mit.edu/rss/topic/artificial-intelligence2',
  'https://venturebeat.com/category/ai/feed/',
  'https://www.marktechpost.com/feed/',
  'https://blog.google/technology/ai/rss/',
  'https://techcrunch.com/category/artificial-intelligence/feed/'
];

const CORPORATE_FEEDS = [
  'https://www.reddit.com/r/careerguidance/.rss',
  'https://www.reddit.com/r/cscareerquestions/.rss',
  'https://www.reddit.com/r/jobs/.rss',
  'https://www.reddit.com/r/antiwork/.rss',
  'https://hbr.org/feed',
  'https://news.google.com/rss/search?q=intitle:hiring+OR+intitle:salary+OR+intitle:increment+OR+intitle:recruitment+OR+intitle:%22office+politics%22&hl=en-US&gl=US&ceid=US:en'
];

const DARK_WEB_FEEDS = [
  'https://blog.torproject.org/feed/',
  'https://www.reddit.com/r/tor/.rss',
  'https://www.reddit.com/r/darknet/.rss',
  'https://news.google.com/rss/search?q=tor+network+OR+dark+web+OR+onion+services+OR+deep+web&hl=en-US&gl=US&ceid=US:en'
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
  if (u.includes('hackaday') || u.includes('iotworldtoday') || u.includes('staceyoniot') || u.includes('electronicsweekly')) return 'IoT & Hardware';
  if (u.includes('techcrunch.com/category/startups') || u.includes('eu-startups') || u.includes('startupnews')) return 'Startup';
  if (u.includes('phoronix') || u.includes('itsfoss') || u.includes('q=open+source')) return 'Open Source';
  if (u.includes('artificialintelligence-news') || u.includes('aibusiness') || u.includes('technologyreview.com/topic/artificial-intelligence') || u.includes('mit.edu/rss/topic/artificial-intelligence') || u.includes('venturebeat.com/category/ai') || u.includes('marktechpost') || u.includes('blog.google/technology/ai') || u.includes('techcrunch.com/category/artificial-intelligence')) return 'AI Enterprise';
  if (u.includes('careerguidance') || u.includes('cscareerquestions') || u.includes('jobs') || u.includes('antiwork') || u.includes('hbr.org') || u.includes('hiring') || u.includes('salary') || u.includes('increment') || u.includes('office')) return 'Corporate Culture';
  if (u.includes('torproject') || u.includes('darknet') || u.includes('r/tor') || u.includes('onion') || u.includes('deep+web')) return 'Dark Web & Tor';
  return 'Tech';
};

const fetchAndParseFeeds = async (feeds: string[]): Promise<NewsItem[]> => {
  try {
    const fetchPromises = feeds.map(async (feedUrl) => {
      try {
        let jsonData = null;
        try {
          let rssDataUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
          const response = await fetch(rssDataUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
              jsonData = data;
            }
          }
        } catch (err) {
          console.warn(`rss2json fetch error for ${feedUrl}, proceeding to fallback...`, err);
        }

        // If rss2json succeeds
        if (jsonData) {
          return jsonData.items.map((item: any) => ({
            id: item.guid || item.link,
            title: item.title,
            summary: (item.description || '').replace(/<[^>]+>/g, '').substring(0, 200) + '...',
            source: item.author || jsonData.feed?.title || 'News Source',
            url: item.link,
            publishedAt: item.pubDate,
            category: item.categories?.[0] || getFallbackCategory(feedUrl)
          }));
        }

        // Fallback: Use allorigins to get raw XML and parse it client-side
        console.warn(`rss2json failed for ${feedUrl}, falling back to allorigins XML parsing...`);
        let fallbackData: any = null;
        try {
          const fallbackRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`);
          fallbackData = await fallbackRes.json();
        } catch (err) {
          console.warn(`allorigins failed for ${feedUrl}, trying corsproxy.io...`);
          try {
            const corsRes = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`);
            const xmlText = await corsRes.text();
            fallbackData = { contents: xmlText };
          } catch (corsErr) {
            console.error(`All fallbacks failed for ${feedUrl}`);
          }
        }
        
        if (fallbackData && fallbackData.contents) {
          const parser = new DOMParser();
          const xml = parser.parseFromString(fallbackData.contents, 'text/xml');
          
          // Check for ATOM feed vs RSS feed
          const isAtom = xml.documentElement.tagName.toLowerCase() === 'feed';
          
          if (isAtom) {
            const entries = Array.from(xml.querySelectorAll('entry')).slice(0, 15);
            return entries.map(entry => {
              const getTagText = (tag: string) => entry.querySelector(tag)?.textContent || '';
              const title = getTagText('title');
              const link = entry.querySelector('link')?.getAttribute('href') || getTagText('link');
              const pubDate = getTagText('published') || getTagText('updated');
              const summary = getTagText('summary') || getTagText('content');
              
              return {
                id: getTagText('id') || link,
                title,
                summary: summary.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
                source: xml.querySelector('feed > title')?.textContent || 'News Source',
                url: link,
                publishedAt: pubDate || new Date().toISOString(),
                category: getFallbackCategory(feedUrl)
              };
            });
          } else {
            const items = Array.from(xml.querySelectorAll('item')).slice(0, 15);
            return items.map(item => {
              const getTagText = (tag: string) => item.querySelector(tag)?.textContent || '';
              const title = getTagText('title');
              const link = getTagText('link');
              const pubDate = getTagText('pubDate') || getTagText('dc:date');
              // Some feeds use <content:encoded> for full content, so check it if description is empty
              const encodedContent = item.getElementsByTagName('content:encoded');
              const description = getTagText('description') || (encodedContent.length > 0 ? encodedContent[0].textContent : '') || '';
              
              return {
                id: getTagText('guid') || link,
                title,
                summary: description.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
                source: xml.querySelector('channel > title')?.textContent || 'News Source',
                url: link,
                publishedAt: pubDate || new Date().toISOString(),
                category: getFallbackCategory(feedUrl)
              };
            });
          }
        }
        
        return [];
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

const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes limit for freshness

async function getCachedFeed(categoryId: string): Promise<NewsItem[] | null> {
  // Try Firestore first
  try {
    const docRef = doc(db, 'cachedFeeds', categoryId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedAt = new Date(data.updatedAt).getTime();
      const isFresh = Date.now() - updatedAt < CACHE_EXPIRY_MS;
      if (isFresh && data.items && data.items.length > 0) {
        console.log(`[Cache Hit - Firestore Fresh] categoryId: ${categoryId}`);
        return data.items as NewsItem[];
      }
      if (data.items && data.items.length > 0) {
        console.log(`[Cache Hit - Firestore Stale] categoryId: ${categoryId}`);
        return data.items as NewsItem[];
      }
    }
  } catch (error) {
    console.warn(`[Cache Error - Firestore Get] categoryId: ${categoryId}`, error);
  }

  // Fallback "else do something" (Local Storage cache)
  try {
    const localDataStr = localStorage.getItem(`cache_feed_${categoryId}`);
    if (localDataStr) {
      const localData = JSON.parse(localDataStr);
      const updatedAt = new Date(localData.updatedAt).getTime();
      const isFresh = Date.now() - updatedAt < CACHE_EXPIRY_MS;
      if (isFresh && localData.items && localData.items.length > 0) {
        console.log(`[Cache Hit - Local Fresh] categoryId: ${categoryId}`);
        return localData.items as NewsItem[];
      }
      if (localData.items && localData.items.length > 0) {
        console.log(`[Cache Hit - Local Stale] categoryId: ${categoryId}`);
        return localData.items as NewsItem[];
      }
    }
  } catch (localStorageError) {
    console.warn(`[Cache Error - Local Get] categoryId: ${categoryId}`, localStorageError);
  }

  return null;
}

async function saveCachedFeed(categoryId: string, items: NewsItem[]): Promise<void> {
  if (!items || items.length === 0) return;

  // Let's store up to 50 items so we keep the DB payload under size boundaries
  const trimmedItems = items.slice(0, 50);

  const cachePayload = {
    categoryId,
    updatedAt: new Date().toISOString(),
    items: trimmedItems
  };

  // Try saving in Firestore (if signed in, rules permit writing)
  if (auth.currentUser) {
    try {
      const docRef = doc(db, 'cachedFeeds', categoryId);
      await setDoc(docRef, cachePayload);
      console.log(`[Cache Saved - Firestore] categoryId: ${categoryId}`);
    } catch (error) {
      console.warn(`[Cache Error - Firestore Set] categoryId: ${categoryId}`, error);
    }
  } else {
    console.log(`[Cache - Skip Firestore Write (Not logged in)] categoryId: ${categoryId}`);
  }

  // Always save in localStorage as "else do something" fallback/offline cache
  try {
    localStorage.setItem(`cache_feed_${categoryId}`, JSON.stringify(cachePayload));
    console.log(`[Cache Saved - Local] categoryId: ${categoryId}`);
  } catch (localStorageError) {
    console.warn(`[Cache Error - Local Set] categoryId: ${categoryId}`, localStorageError);
  }
}

export const newsService = {
  getTopNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('top');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(RSS_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('top', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('top');
    return staleFallback || [];
  },
  getMoneyNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('money');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(MONEY_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('money', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('money');
    return staleFallback || [];
  },
  getCyberNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('cyber');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(CYBER_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('cyber', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('cyber');
    return staleFallback || [];
  },
  getDealsNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('deals');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(DEALS_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('deals', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('deals');
    return staleFallback || [];
  },
  getCompetitionNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('competitions');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(COMPETITION_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('competitions', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('competitions');
    return staleFallback || [];
  },
  getGovtSchemesNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('schemes');
      if (cached) return cached;
    }
    const news = await fetchAndParseFeeds(GOVT_SCHEMES_FEEDS);
    // Extra client-side filter to ensure no political/election news slips through
    const excludeWords = ['election', 'elections', 'polls', 'campaign', 'voting', 'mla', 'mp', 'political', 'politics'];
    const filtered = news.filter(item => {
      const text = (item.title + ' ' + item.summary).toLowerCase();
      return !excludeWords.some(word => new RegExp(`\\b${word}\\b`).test(text));
    });
    if (filtered && filtered.length > 0) {
      await saveCachedFeed('schemes', filtered);
      return filtered;
    }
    const staleFallback = await getCachedFeed('schemes');
    return staleFallback || [];
  },
  getIotNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('iot');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(IOT_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('iot', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('iot');
    return staleFallback || [];
  },
  getStartupNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('startup');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(STARTUP_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('startup', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('startup');
    return staleFallback || [];
  },
  getOpenSourceNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('opensource');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(OPEN_SOURCE_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('opensource', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('opensource');
    return staleFallback || [];
  },
  getAiEnterpriseNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('ai_enterprise');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(AI_ENTERPRISE_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('ai_enterprise', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('ai_enterprise');
    return staleFallback || [];
  },
  getCorporateNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('corporate');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(CORPORATE_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('corporate', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('corporate');
    return staleFallback || [];
  },
  getDarkWebNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('darkweb');
      if (cached) return cached;
    }
    const fresh = await fetchAndParseFeeds(DARK_WEB_FEEDS);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('darkweb', fresh);
      return fresh;
    }
    const staleFallback = await getCachedFeed('darkweb');
    return staleFallback || [];
  }
};

