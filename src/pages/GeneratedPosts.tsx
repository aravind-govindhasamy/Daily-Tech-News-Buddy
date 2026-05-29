import { GeneratedPost, ScheduledPost } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Linkedin, 
  Twitter, 
  Copy, 
  Share2, 
  Calendar, 
  Trash2,
  CheckCircle2,
  Sparkles,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { geminiService } from '../services/geminiService';

interface GeneratedPostsProps {
  posts: GeneratedPost[];
  onDelete: (id: string) => void;
  onSchedule: (scheduled: ScheduledPost) => void;
  onUpdatePost: (id: string, newContent: Partial<GeneratedPost>) => void;
}

export function GeneratedPosts({ posts, onDelete, onSchedule, onUpdatePost }: GeneratedPostsProps) {
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedPost, setSelectedPost] = useState<{ post: GeneratedPost, platform: 'linkedin' | 'twitter' } | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  const handleGenerateImage = (post: GeneratedPost) => {
    if (!post.imagePrompt) return;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(post.imagePrompt)}?width=1024&height=1024&nologo=true`;
    onUpdatePost(post.id, { imageUrl });
    toast.success("Image generated successfully!");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleShare = (platform: 'linkedin' | 'twitter', post: GeneratedPost) => {
    const text = platform === 'linkedin' ? post.linkedin : post.twitter;
    const url = platform === 'linkedin' 
      ? `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(text)}`
      : `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleScheduleSubmit = () => {
    if (!selectedPost || !scheduleDate || !scheduleTime) return;

    const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    const content = selectedPost.platform === 'linkedin' ? selectedPost.post.linkedin : selectedPost.post.twitter;

    const newScheduled: ScheduledPost = {
      id: crypto.randomUUID(),
      postId: selectedPost.post.id,
      content,
      platform: selectedPost.platform,
      scheduledFor,
      status: 'pending'
    };

    onSchedule(newScheduled);
    toast.success("Post scheduled successfully!");
    setSelectedPost(null);
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleEnhanceLinkedIn = async (post: GeneratedPost) => {
    setEnhancingId(post.id);
    try {
      const enhancedContent = await geminiService.enhanceLinkedInPost(post.linkedin);
      onUpdatePost(post.id, { 
        linkedin: enhancedContent,
        originalLinkedin: post.originalLinkedin || post.linkedin
      });
      toast.success("LinkedIn post enhanced!");
    } catch(err) {
      toast.error("Failed to enhance post");
    } finally {
      setEnhancingId(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-6 bg-muted rounded-full">
          <Share2 className="w-12 h-12 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">No generated posts yet</h2>
          <p className="text-muted-foreground">Go to the Daily Feed to generate some content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generated Content</h1>
        <p className="text-muted-foreground">Review and share your AI-generated social media posts.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{post.newsTitle}</CardTitle>
                    <CardDescription>
                      Generated on {new Date(post.createdAt).toLocaleDateString()} • Tone: <Badge variant="outline" className="capitalize">{post.tone}</Badge>
                      {post.newsUrl && (
                        <>
                          {' '}•{' '}
                          <a href={post.newsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">
                            Original Article <ExternalLink className="ml-1 w-3 h-3" />
                          </a>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(post.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="linkedin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="linkedin" className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </TabsTrigger>
                      <TabsTrigger value="twitter" className="flex items-center gap-2">
                        <Twitter className="w-4 h-4" /> Twitter/X
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="linkedin" className="space-y-4">
                      {post.originalLinkedin && (
                        <div className="mb-2">
                          <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                            <Sparkles className="w-3 h-3 mr-1" /> Enhanced by AI
                          </Badge>
                        </div>
                      )}
                      <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm leading-relaxed relative">
                        {post.linkedin}
                      </div>
                      {post.originalLinkedin && (
                        <details className="text-sm mt-2">
                          <summary className="text-muted-foreground cursor-pointer hover:text-foreground inline-flex items-center">
                            View Original Content
                          </summary>
                          <div className="mt-2 p-3 bg-muted/50 rounded-md border text-xs text-muted-foreground whitespace-pre-wrap">
                            {post.originalLinkedin}
                          </div>
                        </details>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(post.linkedin)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleShare('linkedin', post)}>
                          <Share2 className="w-4 h-4 mr-2" /> Share Now
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleEnhanceLinkedIn(post)} disabled={enhancingId === post.id}>
                          {enhancingId === post.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                          {enhancingId === post.id ? 'Enhancing...' : 'Enhance Post'}
                        </Button>
                        <Dialog>
                          <DialogTrigger render={<Button variant="outline" size="sm" onClick={() => setSelectedPost({ post, platform: 'linkedin' })} />}>
                            <Calendar className="w-4 h-4 mr-2" /> Schedule
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Schedule LinkedIn Post</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="time">Time</Label>
                                <Input id="time" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleScheduleSubmit}>Confirm Schedule</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-3">Generated Image Concept (LinkedIn)</h4>
                        {post.imageUrl ? (
                          <>
                            <img 
                              src={post.imageUrl} 
                              alt="AI generated poster for post" 
                              referrerPolicy="no-referrer"
                              className="w-full max-w-sm rounded-lg shadow-sm border"
                            />
                            {post.imagePrompt && (
                              <p className="text-xs text-muted-foreground mt-2 italic max-w-sm">
                                Prompt: {post.imagePrompt}
                              </p>
                            )}
                          </>
                        ) : post.imagePrompt ? (
                          <div className="w-full max-w-sm h-64 bg-muted rounded-lg border border-dashed flex items-center justify-center text-muted-foreground flex-col gap-3">
                            <Sparkles className="w-8 h-8 opacity-50" />
                            <span className="text-sm text-center px-4">Prompt: {post.imagePrompt}</span>
                            <Button variant="outline" size="sm" onClick={() => handleGenerateImage(post)}>
                              Generate Image
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full max-w-sm h-64 bg-muted rounded-lg border border-dashed flex items-center justify-center text-muted-foreground flex-col gap-2">
                            <Sparkles className="w-8 h-8 opacity-50" />
                            <span className="text-sm">No image prompt available</span>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="twitter" className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                        {post.twitter}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(post.twitter)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleShare('twitter', post)}>
                          <Share2 className="w-4 h-4 mr-2" /> Post Now
                        </Button>
                        <Dialog>
                          <DialogTrigger render={<Button variant="outline" size="sm" onClick={() => setSelectedPost({ post, platform: 'twitter' })} />}>
                            <Calendar className="w-4 h-4 mr-2" /> Schedule
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Schedule Twitter Post</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="time">Time</Label>
                                <Input id="time" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleScheduleSubmit}>Confirm Schedule</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      {post.thread && post.thread.length > 0 && (
                        <div className="mt-6 space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" /> Thread Version
                          </h4>
                          <div className="space-y-2">
                            {post.thread.map((part, i) => (
                              <div key={i} className="p-3 bg-muted/50 rounded border text-xs italic">
                                {i + 1}/ {part}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-3">Generated Image Concept (Twitter)</h4>
                        {post.imageUrl ? (
                          <>
                            <img 
                              src={post.imageUrl} 
                              alt="AI generated poster for post" 
                              referrerPolicy="no-referrer"
                              className="w-full max-w-sm rounded-lg shadow-sm border"
                            />
                            {post.imagePrompt && (
                              <p className="text-xs text-muted-foreground mt-2 italic max-w-sm">
                                Prompt: {post.imagePrompt}
                              </p>
                            )}
                          </>
                        ) : post.imagePrompt ? (
                          <div className="w-full max-w-sm h-64 bg-muted rounded-lg border border-dashed flex items-center justify-center text-muted-foreground flex-col gap-3">
                            <Sparkles className="w-8 h-8 opacity-50" />
                            <span className="text-sm text-center px-4">Prompt: {post.imagePrompt}</span>
                            <Button variant="outline" size="sm" onClick={() => handleGenerateImage(post)}>
                              Generate Image
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full max-w-sm h-64 bg-muted rounded-lg border border-dashed flex items-center justify-center text-muted-foreground flex-col gap-2">
                            <Sparkles className="w-8 h-8 opacity-50" />
                            <span className="text-sm">No image prompt available</span>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
