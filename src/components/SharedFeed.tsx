import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NewsItem, GeneratedPost, PostTone } from '../types';
import { geminiService } from '../services/geminiService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Sparkles, ExternalLink, Loader2, Bookmark, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from './FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { setDoc, doc } from 'firebase/firestore';

interface SharedFeedProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  fetchAction: (forceRefresh?: boolean) => Promise<NewsItem[]>;
  onPostGenerated: (post: GeneratedPost) => void;
  badgeClass?: string;
  buttonClass?: string;
  cardClass?: string;
}

export function SharedFeed({ 
  title, 
  description, 
  icon, 
  fetchAction, 
  onPostGenerated, 
  badgeClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80", 
  buttonClass = "", 
  cardClass = "" 
}: SharedFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [tone, setTone] = useState<PostTone>('professional');
  const [visibleCount, setVisibleCount] = useState(12);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [readLaterSavingId, setReadLaterSavingId] = useState<string | null>(null);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setVisibleCount(12);
    try {
      const data = await fetchAction(forceRefresh);
      setNews(data);
    } catch (error) {
      toast.error(`Failed to fetch ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [fetchAction, title]);

  useEffect(() => {
    fetchNews(false);
  }, [fetchNews]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 12, news.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [news.length]);

  const handleGenerate = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const result = await geminiService.generateSocialPosts(item.id, item.title, item.summary, item.source, tone);
      const newPost: GeneratedPost = {
        id: crypto.randomUUID(),
        newsId: item.id,
        newsTitle: item.title,
        newsUrl: item.url,
        linkedin: result.linkedin,
        twitter: result.twitter,
        thread: result.thread,
        imagePrompt: result.imagePrompt,
        imageUrl: result.imagePrompt ? `https://image.pollinations.ai/prompt/${encodeURIComponent(result.imagePrompt)}?width=1024&height=1024&nologo=true` : undefined,
        tone: tone,
        createdAt: new Date().toISOString()
      };
      onPostGenerated(newPost);
      toast.success("Social media posts generated!");
    } catch (error) {
      toast.error("Failed to generate posts");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSave = async (item: NewsItem) => {
    if (!user) {
      toast.error("Please sign in to save posts.");
      return;
    }
    
    setSavingId(item.id);
    const path = `savedPosts/${item.id}`;
    try {
      const postId = crypto.randomUUID();
      await setDoc(doc(db, 'savedPosts', postId), {
        userId: user.uid,
        newsId: item.id,
        title: item.title,
        url: item.url,
        source: item.source || "Unknown source",
        createdAt: new Date().toISOString()
      });
      toast.success("Post saved to Favorites!");
    } catch (error) {
      toast.error("Failed to save post");
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSavingId(null);
    }
  };

  const handleReadLater = async (item: NewsItem) => {
    if (!user) {
      toast.error("Please sign in to add to Read Later.");
      return;
    }
    
    setReadLaterSavingId(item.id);
    const path = `readLater/${item.id}`;
    try {
      const postId = crypto.randomUUID();
      await setDoc(doc(db, 'readLater', postId), {
        userId: user.uid,
        newsId: item.id,
        title: item.title,
        url: item.url,
        source: item.source || "Unknown source",
        createdAt: new Date().toISOString()
      });
      toast.success("Added to Read Later!");
    } catch (error) {
      toast.error("Failed to add to Read Later");
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setReadLaterSavingId(null);
    }
  };

  const visibleNews = news.slice(0, visibleCount);

  const isToday = (dateString: string) => {
    const pubDate = new Date(dateString);
    const today = new Date();
    return pubDate.getDate() === today.getDate() && 
           pubDate.getMonth() === today.getMonth() && 
           pubDate.getFullYear() === today.getFullYear();
  };

  const todayNews = visibleNews.filter(n => isToday(n.publishedAt));
  const olderNews = visibleNews.filter(n => !isToday(n.publishedAt));

  const renderNewsCards = (items: NewsItem[], startIndex: number = 0) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={`${item.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ((index + startIndex) % 12) * 0.05 }}
            layout
          >
            <Card className={`h-full flex flex-col hover:shadow-lg transition-shadow ${cardClass}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={badgeClass}>{item.category}</Badge>
                  <span className="text-xs text-muted-foreground">{item.source}</span>
                </div>
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                <CardDescription className="line-clamp-3">{item.summary}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-6 flex gap-2">
                <Button 
                  className={`flex-1 ${buttonClass}`}
                  onClick={() => handleGenerate(item)}
                  disabled={generatingId === item.id}
                >
                  {generatingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate Post
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleSave(item)}
                  disabled={savingId === item.id}
                  title="Save to Favorites"
                >
                  {savingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleReadLater(item)}
                  disabled={readLaterSavingId === item.id}
                  title="Read Later"
                >
                  {readLaterSavingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </Button>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "icon" })}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {icon}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden sm:inline">Tone:</span>
            <Select value={tone} onValueChange={(v) => setTone(v as PostTone)}>
              <SelectTrigger className="w-[120px] sm:w-[140px]">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchNews(true)} disabled={loading} title="Force refresh from source">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {todayNews.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Today
              </h2>
              {renderNewsCards(todayNews, 0)}
            </div>
          )}

          {olderNews.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" /> Older
              </h2>
              {renderNewsCards(olderNews, todayNews.length)}
            </div>
          )}
          
          {/* Infinite Scroll Observer Target */}
          <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-8">
            {visibleCount < news.length ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : news.length > 0 ? (
              <p className="text-muted-foreground">You've reached the end!</p>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">No news found.</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                  If you see this immediately, the RSS translation service might be temporarily rate-limited. Try again in a few seconds.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
