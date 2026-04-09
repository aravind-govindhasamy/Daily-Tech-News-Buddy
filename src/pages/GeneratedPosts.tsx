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
  CheckCircle2
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

interface GeneratedPostsProps {
  posts: GeneratedPost[];
  onDelete: (id: string) => void;
  onSchedule: (scheduled: ScheduledPost) => void;
}

export function GeneratedPosts({ posts, onDelete, onSchedule }: GeneratedPostsProps) {
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedPost, setSelectedPost] = useState<{ post: GeneratedPost, platform: 'linkedin' | 'twitter' } | null>(null);

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
                      <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                        {post.linkedin}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(post.linkedin)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleShare('linkedin', post)}>
                          <Share2 className="w-4 h-4 mr-2" /> Share Now
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
                    </TabsContent>

                    <TabsContent value="twitter" className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                        {post.twitter}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(post.twitter)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy
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
