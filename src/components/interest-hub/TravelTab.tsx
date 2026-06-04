import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Sparkles, 
  CheckSquare, 
  Square, 
  MapPin, 
  Coins, 
  Calendar,
  ExternalLink,
  Loader2,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { INITIAL_POSTS, EVENTS } from '../../services/communityData';
import { CommunityPost } from '../../types/community';
import { NewsItem } from '../../types';
import { newsService } from '../../services/newsService';
import { geminiService } from '../../services/geminiService';
import { toast } from 'sonner';

interface TravelTabProps {
  posts: CommunityPost[];
  onAddPost: (content: string, subcategory: string) => void;
  onAddPoints: (points: number) => void;
  onPostGenerated: (post: any) => void;
}

export function TravelTab({
  posts,
  onAddPost,
  onAddPoints,
  onPostGenerated
}: TravelTabProps) {
  // Travel Essentials checklist
  const [checklist, setChecklist] = useState([
    { id: '1', item: 'Compact waterproof shelter / tent', completed: true },
    { id: '2', item: 'Topographic GPS route charts', completed: false },
    { id: '3', item: 'Thermal emergency sleeping sack', completed: true },
    { id: '4', item: 'Opossum/feces biofiltration water straw', completed: false },
    { id: '5', item: 'High-contrast solar backup power matrix', completed: false }
  ]);

  // Scraped Travel news RSS
  const [scrapedNews, setScrapedNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTravelLive() {
      setLoadingNews(true);
      try {
        const data = await newsService.getTravelNews(false);
        setScrapedNews(data);
      } catch (err) {
        console.warn('Error fetching travel news:', err);
      } finally {
        setLoadingNews(false);
      }
    }
    loadTravelLive();
  }, []);

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = !item.completed;
        if (newStatus) {
          onAddPoints(10);
          toast.success(`item checked! Got +10 Points`);
        }
        return { ...item, completed: newStatus };
      }
      return item;
    }));
  };

  const handleGeneratePost = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const result = await geminiService.generateSocialPosts(
        item.id,
        item.title,
        item.summary || '',
        item.source || 'Wanderlust Feed',
        'casual'
      );
      const newPost = {
        id: crypto.randomUUID(),
        newsId: item.id,
        newsTitle: item.title,
        newsUrl: item.url,
        linkedin: result.linkedin,
        twitter: result.twitter,
        thread: result.thread,
        imageUrl: item.url ? `https://image.pollinations.ai/prompt/${encodeURIComponent(item.title)}?width=800&height=500&nologo=true` : undefined,
        tone: 'casual',
        createdAt: new Date().toISOString()
      };
      onPostGenerated(newPost);
      toast.success('Social post drafted successfully!');
    } catch (err) {
      toast.error('Could not translate travel article.');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Travel Essentials checklist */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" /> Wilderness Packing Checklist
          </h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" /> +10 points / checkoff
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            {checklist.map(item => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full text-left p-3 rounded-lg border text-xs font-semibold flex items-center gap-3 transition-colors ${
                  item.completed
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300'
                  : 'border-border/40 hover:bg-muted bg-background/50'
                }`}
              >
                {item.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <span className={item.completed ? 'line-through opacity-80' : ''}>{item.item}</span>
              </button>
            ))}
          </div>

          <div className="p-4 border border-border/30 rounded-lg bg-muted/10 text-xs flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-foreground mb-1">Backpacking Rule of Thumbs</h4>
              <p className="text-muted-foreground leading-relaxed">
                Pack only items that serve double functions. Never load more than 15% of your total bodyweight into your backpack during high elevation climbs or trail hikes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[11px] font-bold text-emerald-600 cursor-pointer hover:underline">
              <span>View Wilderness Survival Hub &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Travel Destinations & Scraped news */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Travel Guides list */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 border-b border-border/50 pb-2">
            <MapPin className="w-4 h-4 text-emerald-500" /> Hidden Spots & Escapes
          </h3>

          <div className="space-y-3">
            {INITIAL_POSTS.filter(p => p.category === 'travel').map((post) => (
              <div key={post.id} className="p-3 border border-border/40 hover:border-emerald-500/20 rounded-lg bg-muted/5 flex gap-3 text-xs transition">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="post target" className="w-20 h-16 rounded object-cover border border-border/30" />
                )}
                <div className="space-y-1 my-auto">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">{post.subcategory || 'Hidden Gem'}</span>
                  <p className="font-bold line-clamp-1 text-slate-800 dark:text-zinc-200">{post.content.substring(0, 85)}...</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">📍 Verified by {post.authorName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Live Scraped Travel news */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-500" /> Scraped Wanderlust Feed
            </h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Real Live</span>
          </div>

          {loadingNews ? (
            <div className="space-y-3.5 py-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse p-3 border border-border/30 rounded-lg space-y-1">
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-2 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : scrapedNews.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs text-muted-foreground">The Travel feed could not be resolved instantly.</p>
              <button
                onClick={async () => {
                  setLoadingNews(true);
                  const data = await newsService.getTravelNews(true);
                  if (data && data.length > 0) setScrapedNews(data);
                  setLoadingNews(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white border-emerald-500 border rounded-lg px-4 py-2 font-semibold"
              >
                🔄 Retry Fetching Feeds
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {scrapedNews.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 bg-muted/5 border border-border/40 rounded-lg space-y-2 hover:bg-muted/15 transition-all text-xs">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-bold text-emerald-700">{item.source || 'Lonely Planet'}</span>
                    <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono uppercase text-[9px] dark:bg-emerald-950/40 dark:text-emerald-400">
                      Scraped
                    </span>
                  </div>
                  
                  <h4 className="font-bold leading-tight text-[12px] text-foreground/95">{item.title}</h4>
                  <p className="line-clamp-2 text-muted-foreground text-[11px] leading-relaxed">{item.summary}</p>
                  
                  <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                    <button
                      onClick={() => handleGeneratePost(item)}
                      disabled={generatingId === item.id}
                      className="flex-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[10px] font-bold py-1 px-2.2 rounded transition flex items-center justify-center gap-1"
                    >
                      {generatingId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Draft Social Promo
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 border rounded text-muted-foreground hover:bg-muted transition"
                      title="View original coverage page"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
