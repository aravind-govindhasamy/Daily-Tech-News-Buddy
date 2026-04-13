import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NewsItem, GeneratedPost, PostTone } from '../types';
import { geminiService } from '../services/geminiService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface SharedFeedProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  fetchAction: () => Promise<NewsItem[]>;
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

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setVisibleCount(12);
    try {
      const data = await fetchAction();
      setNews(data);
    } catch (error) {
      toast.error(`Failed to fetch ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [fetchAction, title]);

  useEffect(() => {
    fetchNews();
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
      const result = await geminiService.generateSocialPosts(item, tone);
      const newPost: GeneratedPost = {
        id: crypto.randomUUID(),
        newsId: item.id,
        newsTitle: item.title,
        linkedin: result.linkedin,
        twitter: result.twitter,
        thread: result.thread,
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

  const visibleNews = news.slice(0, visibleCount);

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
          <Button variant="outline" size="icon" onClick={fetchNews} disabled={loading}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {visibleNews.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index % 12) * 0.05 }}
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
                      <Button variant="outline" size="icon" nativeButton={false} render={<a href={item.url} target="_blank" rel="noopener noreferrer" />}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Infinite Scroll Observer Target */}
          <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-8">
            {visibleCount < news.length ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : news.length > 0 ? (
              <p className="text-muted-foreground">You've reached the end!</p>
            ) : (
              <p className="text-muted-foreground">No news found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
