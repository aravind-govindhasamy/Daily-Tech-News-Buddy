import { useState, useEffect } from 'react';
import { newsService } from '../services/newsService';
import { geminiService } from '../services/geminiService';
import { NewsItem, GeneratedPost, PostTone } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface FeedProps {
  onPostGenerated: (post: GeneratedPost) => void;
}

export function Feed({ onPostGenerated }: FeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [tone, setTone] = useState<PostTone>('professional');

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await newsService.getTopNews();
      setNews(data);
    } catch (error) {
      toast.error("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Tech Feed</h1>
          <p className="text-muted-foreground">Stay updated with the latest in tech and IoT.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tone:</span>
            <Select value={tone} onValueChange={(v) => setTone(v as PostTone)}>
              <SelectTrigger className="w-[140px]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                    </div>
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{item.summary}</CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-6 flex gap-2">
                    <Button 
                      className="flex-1" 
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
                    <Button variant="outline" size="icon" render={<a href={item.url} target="_blank" rel="noopener noreferrer" />}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
