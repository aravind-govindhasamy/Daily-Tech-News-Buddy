import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Plus, 
  Sparkles, 
  Globe, 
  Coins, 
  TrendingUp, 
  FileText,
  Loader2,
  Bookmark,
  ExternalLink,
  Clock
} from 'lucide-react';
import { CommunityPost, LeaderboardUser } from '../../types/community';
import { NewsItem } from '../../types';
import { newsService } from '../../services/newsService';
import { geminiService } from '../../services/geminiService';
import { toast } from 'sonner';

interface GlobalFeedTabProps {
  posts: CommunityPost[];
  onAddPost: (content: string, subcategory: string) => void;
  leaderboard: LeaderboardUser[];
  userPoints: number;
  onAddPoints: (points: number) => void;
  onPostGenerated: (post: any) => void;
}

export function GlobalFeedTab({
  posts,
  onAddPost,
  leaderboard,
  userPoints,
  onAddPoints,
  onPostGenerated
}: GlobalFeedTabProps) {
  const [newPostContent, setNewPostContent] = useState('');
  const [subcategory, setSubcategory] = useState('General Discussion');
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLiveNews() {
      setLoadingNews(true);
      try {
        const data = await newsService.getGlobalCommunityNews(false);
        setLiveNews(data);
      } catch (err) {
        console.warn('Error loading global community news:', err);
      } finally {
        setLoadingNews(false);
      }
    }
    loadLiveNews();
  }, []);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    onAddPost(newPostContent, subcategory);
    setNewPostContent('');
    onAddPoints(20);
    toast.success('Post shared with the community! (+20 Points)');
  };

  const handleGeneratePost = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const result = await geminiService.generateSocialPosts(
        item.id,
        item.title,
        item.summary || '',
        item.source || 'Scraped Source',
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
      toast.success('Social promo posts generated from real live news!');
    } catch (err) {
      toast.error('Failed to generate promo posts.');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Post Creator and Interactive Post List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Share your Thoughts
            </h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> Earn 20 points per post
            </span>
          </div>

          <form onSubmit={handlePostSubmit} className="space-y-3">
            <textarea
              className="w-full min-h-[90px] p-3 rounded-lg border border-border/80 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
              placeholder="What interesting fact, article or travel report did you run into today?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Channel:</span>
                <select 
                  className="bg-background border border-border text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                >
                  <option value="General Discussion">💬 General Discussion</option>
                  <option value="Global Discoveries">🌍 Global Discoveries</option>
                  <option value="Inventions & Sci">🔬 Inventions & Sci</option>
                  <option value="Pop Culture Trivia">🍿 Pop Culture Trivia</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-2 transition duration-200"
              >
                <Plus className="w-3.5 h-3.5" /> Share Post
              </button>
            </div>
          </form>
        </div>

        {/* Community Posts */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Trending Social Threads</h3>
          {posts.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl bg-muted/20">
              <p className="text-sm text-muted-foreground">No social discussions in this circle yet.</p>
            </div>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post.id}
                className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4 hover:border-border transition-colors duration-200"
                layout
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.authorAvatar} 
                      alt={post.authorName} 
                      className="w-10 h-10 rounded-full object-cover border border-border/85" 
                    />
                    <div>
                      <div className="flex items-center gap-2Heading">
                        <span className="text-sm font-semibold text-foreground">{post.authorName}</span>
                        <span className="text-[10px] bg-primary/10 text-primary dark:text-primary-foreground font-semibold px-2 py-0.5 rounded-full border border-primary/20">
                          {post.authorReputation}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(post.createdAt || '').toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {post.subcategory && (
                    <span className="text-xs bg-muted text-muted-foreground font-medium px-2.5 py-1 rounded-md border">
                      {post.subcategory}
                    </span>
                  )}
                </div>

                <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-border/60 max-h-[300px]">
                    <img src={post.imageUrl} alt="Post asset" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border/45 pt-3.5 text-muted-foreground text-xs font-medium">
                  <div className="flex items-center gap-5">
                    <button className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                      <ThumbsUp className="w-4 h-4" /> <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                      <MessageSquare className="w-4 h-4" /> <span>{post.commentsCount}</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                    <Share2 className="w-4 h-4" /> <span>Share</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Mini Leaderboard and Real Scraped Live News */}
      <div className="space-y-6">
        {/* Leaderboard widget */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Leaderboard
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200">
              My: {userPoints} Pts
            </span>
          </div>

          <div className="space-y-2.5">
            {leaderboard.slice(0, 5).map((user, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                  idx === 0 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200' 
                  : 'bg-muted/10 border-border/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-muted-foreground w-4 shrink-0 text-center">{idx + 1}</span>
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-medium truncate">{user.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold">{user.points}</span>
                  <span className="text-[10px] text-muted-foreground block">{user.reputation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Live RSS Scraped News Section */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/55 pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" /> Live Scraped Explorer Feed
            </h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Internet Feed</span>
          </div>

          {loadingNews ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse space-y-1.5 p-2 border border-border/40 rounded-lg">
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-2 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : liveNews.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">No recent scraped news found.</p>
              <button 
                onClick={async () => {
                  setLoadingNews(true);
                  const data = await newsService.getGlobalCommunityNews(true);
                  setLiveNews(data);
                  setLoadingNews(false);
                }}
                className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
              >
                🔄 Refresh Feed
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
              {liveNews.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-border/40 bg-muted/5 space-y-2 hover:bg-muted/15 transition-all text-xs">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-semibold text-indigo-600">{item.source || 'Mental Floss'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Recent</span>
                  </div>
                  <h4 className="font-bold line-clamp-2 text-[12px] leading-tight text-foreground/95">{item.title}</h4>
                  <p className="line-clamp-2 text-muted-foreground text-[11px] leading-relaxed">{item.summary}</p>
                  
                  <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                    <button
                      onClick={() => handleGeneratePost(item)}
                      disabled={generatingId === item.id}
                      className="flex-1 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[10px] font-bold py-1 px-2.2 rounded transition flex items-center justify-center gap-1"
                    >
                      {generatingId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Promote to Main Feed
                    </button>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-1 border rounded text-muted-foreground hover:bg-muted transition"
                      title="View original article"
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
