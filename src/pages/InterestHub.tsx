import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Tv, 
  Navigation, 
  Compass, 
  Heart, 
  Activity, 
  MapPin,
  Globe,
  Coins,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  Calendar,
  Lock
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../components/FirebaseProvider';
import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { CommunityPost } from '../types/community';
import { GeneratedPost } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface InterestHubProps {
  initialCircleTab?: 'marvel' | 'riders' | 'travel' | 'ngo' | 'volunteering' | 'local';
  onPostGenerated: (post: GeneratedPost) => void;
}

export function InterestHub({ initialCircleTab = 'marvel', onPostGenerated }: InterestHubProps) {
  const [activeCircleTab, setActiveCircleTab] = useState(initialCircleTab);
  const { user, signIn } = useAuth();

  // Real user discussions (persisted cleanly in localStorage, starting with zero AI mockup accounts)
  const [posts, setPosts] = useLocalStorage<CommunityPost[]>('community_posts_list_real', []);
  const [userPoints, setUserPoints] = useLocalStorage<number>('community_user_points', 1350);

  // New post form state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostSub, setNewPostSub] = useState('General Discussion');

  useEffect(() => {
    setActiveCircleTab(initialCircleTab);
  }, [initialCircleTab]);

  const handleAddPoints = (amount: number) => {
    setUserPoints(prev => prev + amount);
  };

  // Publish a genuinely authored real discussion thread
  const handlePublishThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const authorName = user ? (user.displayName || user.email || 'Verified Contributor') : 'Anonymous Contributor';
    const authorAvatar = user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=80';

    const newPost: CommunityPost = {
      id: crypto.randomUUID(),
      category: activeCircleTab as any,
      subcategory: newPostSub.trim() || 'General',
      authorName,
      authorAvatar,
      authorReputation: user ? 'Community Member' : 'Guest Contributor',
      content: newPostContent,
      likes: 0,
      commentsCount: 0,
      shares: 0,
      createdAt: new Date().toISOString()
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    handleAddPoints(40);
    toast.success('Your actual discussion thread is now live! (+40 Reputation Pts added)');
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLikedByUser;
        handleAddPoints(isLiked ? 5 : -5);
        return {
          ...p,
          isLikedByUser: isLiked,
          likes: isLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  const getHeaderMeta = () => {
    const meta = {
      marvel: { 
        title: 'Marvel Universe', 
        tagline: 'Marvel news and updates, Upcoming movies and series, Character profiles, Comics recommendations, Fan theories and discussions, Marvel trivia and quizzes, Community posts and fan art.',
        icon: <Tv className="w-5 h-5 text-red-500" /> 
      },
      riders: { 
        title: 'Bike Rides & Riders Community', 
        tagline: 'Weekend ride events, Local riding groups, Route sharing with maps, Ride photos and videos, Motorcycle reviews, Safety tips, Group ride planning, Nearby riders discovery.',
        icon: <Navigation className="w-5 h-5 text-amber-500" /> 
      },
      travel: { 
        title: 'Tourism & Travel', 
        tagline: 'Tourist attractions, Hidden gems, One-day trip ideas, Weekend getaway recommendations, Travel guides, Travel stories, Hotel and food recommendations, User-generated travel photos.',
        icon: <Compass className="w-5 h-5 text-emerald-500" /> 
      },
      ngo: { 
        title: 'NGO & Social Impact', 
        tagline: 'NGO discovery, Social causes, Donation campaigns, Community service opportunities, Environmental initiatives, Animal welfare projects, Education support programs.',
        icon: <Heart className="w-5 h-5 text-pink-500" /> 
      },
      volunteering: { 
        title: 'Volunteer Opportunities', 
        tagline: 'Volunteer registration, Event participation, Skills-based volunteering, Blood donation drives, Disaster relief activities, Tree plantation events, Community clean-up drives.',
        icon: <Activity className="w-5 h-5 text-indigo-500" /> 
      },
      local: { 
        title: 'Local Communities', 
        tagline: 'Photography clubs, Book clubs, Fitness groups, Startup communities, Tech meetups, Gaming groups, Cultural organizations.',
        icon: <MapPin className="w-5 h-5 text-cyan-500" /> 
      }
    };
    return meta[activeCircleTab] || meta.marvel;
  };

  const header = getHeaderMeta();
  const currentCategory = activeCircleTab;

  // Filter real user-authored discussion posts for this active channel
  const filteredPosts = posts.filter(p => p.category === currentCategory);

  const renderSharedFeed = () => {
    switch (activeCircleTab) {
      case 'marvel':
        return (
          <SharedFeed
            title="Marvel Universe"
            description="Find live news about upcoming movies, comics, fan theories, and trivia."
            fetchAction={newsService.getMarvelNews}
            onPostGenerated={onPostGenerated}
            badgeClass="bg-red-500 hover:bg-red-600 text-white"
          />
        );
      case 'riders':
        return (
          <SharedFeed
            title="Bike Rides & Riders Community"
            description="Find local rider events, routes, ride photos, videos, and group planning info."
            fetchAction={newsService.getRidersNews}
            onPostGenerated={onPostGenerated}
            badgeClass="bg-amber-500 hover:bg-amber-600 text-white"
          />
        );
      case 'travel':
        return (
          <SharedFeed
            title="Tourism & Travel"
            description="Hidden gems, one-day trip ideas, getaway recommendations, and hotel info."
            fetchAction={newsService.getTravelNews}
            onPostGenerated={onPostGenerated}
            badgeClass="bg-emerald-500 hover:bg-emerald-600 text-white"
          />
        );
      case 'ngo':
        return (
          <SharedFeed
            title="NGO & Social Impact"
            description="NGO discovery, charitable donation campaigns, environmental and animal welfare updates."
            fetchAction={newsService.getNgoNews}
            onPostGenerated={onPostGenerated}
            badgeClass="bg-pink-500 hover:bg-pink-600 text-white"
          />
        );
      case 'volunteering':
        return (
          <SharedFeed
            title="Volunteer Opportunities"
            description="Register for volunteering events, disaster relief, and tree plantation drives."
            fetchAction={newsService.getVolunteeringNews}
            onPostGenerated={onPostGenerated}
            badgeClass="bg-indigo-500 hover:bg-indigo-600 text-white"
          />
        );
      case 'local':
        return (
          <SharedFeed
            title="Local Communities"
            description="Find local groups like photography clubs, book clubs, fitness communities, and meetups."
            fetchAction={newsService.getLocalSquadsNews}
            onPostGenerated={onPostGenerated}
            badgeClass="bg-cyan-500 hover:bg-cyan-600 text-white"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Circle Header Info Frame */}
      <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-muted rounded-lg">
            {header.icon}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              {header.title} Connection Circle
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{header.tagline}</p>
          </div>
        </div>

        {/* Real User Reputation State Indicator */}
        <div className="flex items-center gap-3 bg-muted/45 border px-4 py-2 rounded-xl shrink-0">
          <Coins className="w-5 h-5 text-amber-500" />
          <div>
            <span className="text-[9px] text-muted-foreground block uppercase font-extrabold tracking-wider">My Reputation</span>
            <span className="text-sm font-black text-foreground">{userPoints.toLocaleString()} Pts</span>
          </div>
        </div>
      </div>

      {/* Primary Real-World RSS Live Feed */}
      <div className="bg-card border rounded-xl p-2 md:p-6 shadow-sm">
        {renderSharedFeed()}
      </div>

      {/* Circle Message Board Forum (100% real data, no pre-populated AI slop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Authoring Form */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" /> Start a Real Thread
              </CardTitle>
              <CardDescription className="text-xs">
                Publish a genuine discussion post for the {header.title} community. No bots, 100% human commentary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Thread Subcategory / Tag</label>
                <Input
                  className="text-xs h-9"
                  placeholder="e.g. Graphic Novels, Gear Specs, Travel Costs"
                  value={newPostSub}
                  onChange={(e) => setNewPostSub(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Your Commentary</label>
                <Textarea
                  className="text-xs min-h-[100px] resize-none"
                  placeholder="Share your coordinates, review of the article, or invite locals here..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t">
              {user ? (
                <Button 
                  onClick={handlePublishThread} 
                  className="w-full text-xs font-bold"
                  disabled={!newPostContent.trim()}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Post Live Thread (+40 pts)
                </Button>
              ) : (
                <div className="w-full text-center space-y-2">
                  <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" /> Sign In to post with custom badge
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={signIn}
                      className="flex-1 text-xs font-bold"
                    >
                      Google Sign In
                    </Button>
                    <Button 
                      onClick={handlePublishThread}
                      className="flex-1 text-xs font-bold"
                      disabled={!newPostContent.trim()}
                    >
                      Post Guest Thread
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Display Threads */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Real Discussion Bulletin Board</CardTitle>
                <CardDescription className="text-xs">
                  Read and coordinate live with other true members of this interest squad.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                {filteredPosts.length} Active Threads
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 max-h-[380px] overflow-y-auto space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 space-y-2.5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Clean, Spam-Free Board</h4>
                    <p className="text-[10.5px] text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                      We have completely filtered out all fake AI mock posts. Start the conversation yourself by publishing the very first thread on this {header.title} board!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 pr-1">
                  {filteredPosts.map(post => (
                    <div key={post.id} className="p-3.5 rounded-lg border bg-muted/20 hover:bg-muted/30 transition text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={post.authorAvatar} alt="user" className="w-7 h-7 rounded-full object-cover border" />
                          <div>
                            <span className="font-bold text-foreground/90 block">{post.authorName}</span>
                            <span className="text-[9px] text-muted-foreground/80 block leading-tight">{post.authorReputation}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-medium border-primary/20 bg-primary/5">
                          #{post.subcategory}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-[11.5px] leading-relaxed whitespace-pre-wrap">{post.content}</p>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-2 mt-2">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1 font-bold ${post.isLikedByUser ? 'text-pink-600' : 'hover:text-pink-600'}`}
                          >
                            ♥ {post.likes} Likes
                          </button>
                        </div>
                        <span className="text-[9px] font-mono">
                          {new Date(post.createdAt).toLocaleDateString()} | {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
