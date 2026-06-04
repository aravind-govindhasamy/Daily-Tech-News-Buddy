import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Sparkles, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  ThumbsUp, 
  MessageSquare,
  Bookmark,
  ExternalLink,
  Loader2,
  Check
} from 'lucide-react';
import { ROUTES, EVENTS, INITIAL_POSTS } from '../../services/communityData';
import { RiderRoute, EventItem, CommunityPost } from '../../types/community';
import { NewsItem } from '../../types';
import { newsService } from '../../services/newsService';
import { geminiService } from '../../services/geminiService';
import { toast } from 'sonner';

interface RidersTabProps {
  posts: CommunityPost[];
  onAddPost: (content: string, subcategory: string) => void;
  onAddPoints: (points: number) => void;
  onPostGenerated: (post: any) => void;
}

export function RidersTab({
  posts,
  onAddPost,
  onAddPoints,
  onPostGenerated
}: RidersTabProps) {
  const [activeRoute, setActiveRoute] = useState<RiderRoute>(ROUTES[0]);
  const [localEvents, setLocalEvents] = useState<EventItem[]>(
    EVENTS.filter(e => e.category === 'riders')
  );

  // Short/Reels loops
  const riderReels = INITIAL_POSTS.filter(p => p.category === 'riders' && p.reelsUrl);
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [reelLikes, setReelLikes] = useState(riderReels[0]?.likes || 1200);
  const [isLiked, setIsLiked] = useState(false);

  // Scraped RSS news
  const [scrapedNews, setScrapedNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadRidersLive() {
      setLoadingNews(true);
      try {
        const data = await newsService.getRidersNews(false);
        setScrapedNews(data);
      } catch (err) {
        console.warn('Error loading live riders news:', err);
      } finally {
        setLoadingNews(false);
      }
    }
    loadRidersLive();
  }, []);

  const handleRsvp = (eventId: string) => {
    setLocalEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const enrolled = !e.userRsvp;
        if (enrolled) {
          onAddPoints(100);
          toast.success('RSVP Confirmed! +100 Quest Points added.');
        } else {
          toast.info('RSVP cancelled.');
        }
        return {
          ...e,
          userRsvp: enrolled,
          attendeeCount: enrolled ? e.attendeeCount + 1 : e.attendeeCount - 1
        };
      }
      return e;
    }));
  };

  const handleLikeReel = () => {
    if (isLiked) {
      setReelLikes(l => l - 1);
      setIsLiked(false);
    } else {
      setReelLikes(l => l + 1);
      setIsLiked(true);
      onAddPoints(5);
      toast.success('Video liked! (+5 pts)');
    }
  };

  const handleGeneratePost = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const result = await geminiService.generateSocialPosts(
        item.id,
        item.title,
        item.summary || '',
        item.source || 'Riders Feed',
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
      toast.success('Dispatched real-world motorcycle feed article draft!');
    } catch (err) {
      toast.error('Failed to parse and generate social prompt.');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Track Planner Map & SVG Visualizer */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Navigation className="w-5 h-5 text-amber-500" /> Biker Route Vector Planner
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-1">
            {ROUTES.map(route => (
              <button
                key={route.id}
                onClick={() => setActiveRoute(route)}
                className={`w-full text-left p-3 rounded-lg border text-xs font-semibold flex flex-col gap-1 transition ${
                  activeRoute.id === route.id
                  ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-350'
                  : 'border-border/40 bg-background/50 hover:bg-muted'
                }`}
              >
                <span className="font-bold">{route.routeName}</span>
                <span className="text-[10px] text-muted-foreground">Difficulty: {route.difficulty} | {route.lengthKm}km</span>
              </button>
            ))}
          </div>

          {/* Interactive Route SVG Canvas plotting waypoints */}
          <div className="md:col-span-2 border border-border/40 rounded-xl p-4 bg-muted/10 flex flex-col justify-between min-h-[240px]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> Plotter Preview</span>
              <span className="text-[10px] text-muted-foreground">{activeRoute.elevationM}m Elevation</span>
            </div>

            <div className="relative w-full h-[140px] bg-background border border-border/30 rounded-lg overflow-hidden flex items-center justify-center">
              {/* Plot absolute waypoints connected via SVGs paths */}
              <svg className="absolute inset-0 w-full h-full p-6">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <path
                  d={activeRoute.waypoints.map((wp, idx) => `${idx === 0 ? 'M' : 'L'} ${(wp.x / 100) * 350} ${(wp.y / 100) * 80}`).join(' ')}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
                
                {/* Nodes rendering */}
                {activeRoute.waypoints.map((wp, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={(wp.x / 100) * 350}
                      cy={(wp.y / 100) * 80}
                      r="5.5"
                      fill="#d97706"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={(wp.x / 100) * 350}
                      y={(wp.y / 100) * 80 - 10}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-[8px] font-bold text-slate-800 dark:text-slate-100 uppercase"
                    >
                      {wp.label.split(':')[0]}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-1 rounded text-[9px] text-zinc-100 font-mono">
                Start: {activeRoute.startPoint} &rarr; End: {activeRoute.endPoint}
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
              *Coordinates connected. Click left routes to verify other routes coordinates of biker groups.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Events Schedules & Live Scraped Tech News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Schedule list */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 border-b border-border/50 pb-2">
            <Calendar className="w-4 h-4 text-amber-500" /> Upcoming Group Rides
          </h3>

          <div className="space-y-4">
            {localEvents.map(event => (
              <div key={event.id} className="p-3.5 rounded-lg border border-border/40 bg-muted/10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground/95">{event.title}</h4>
                  <span className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded border dark:bg-amber-950/40 dark:text-amber-400">
                    +{event.rewardPoints} Pts
                  </span>
                </div>

                <p className="text-muted-foreground text-[11.5px] leading-relaxed">{event.description}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {event.date} | {event.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {event.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-amber-500" /> {event.attendeeCount} attending</span>
                </div>

                <button
                  onClick={() => handleRsvp(event.id)}
                  className={`w-full font-bold py-1.8 rounded-md text-xs transition flex items-center justify-center gap-2 ${
                    event.userRsvp
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                  }`}
                >
                  {event.userRsvp ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" /> Joined / View Ticket QR
                    </>
                  ) : (
                    'RSVP & Download Crest Map'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Real Live Scraped Riders news feed */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-500" /> Scraped Riders & Adventure Intel
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
              <p className="text-xs text-muted-foreground">The Riders feed could not be fetched instantly.</p>
              <button
                onClick={async () => {
                  setLoadingNews(true);
                  const data = await newsService.getRidersNews(true);
                  if (data && data.length > 0) setScrapedNews(data);
                  setLoadingNews(false);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-xs text-white border-amber-500 border rounded-lg px-4 py-2 font-semibold"
              >
                🔄 Retry Fetching Feeds
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {scrapedNews.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 bg-muted/5 border border-border/40 rounded-lg space-y-2 hover:bg-muted/15 transition-all text-xs">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-bold text-amber-700">{item.source || 'Adventure Rider'}</span>
                    <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-mono uppercase text-[9px] dark:bg-amber-950/40 dark:text-amber-400">
                      Scraped
                    </span>
                  </div>
                  
                  <h4 className="font-bold leading-tight text-[12px] text-foreground/95">{item.title}</h4>
                  <p className="line-clamp-2 text-muted-foreground text-[11px] leading-relaxed">{item.summary}</p>
                  
                  <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                    <button
                      onClick={() => handleGeneratePost(item)}
                      disabled={generatingId === item.id}
                      className="flex-1 bg-amber-600/10 hover:bg-amber-600 text-amber-700 hover:text-white text-[10px] font-bold py-1 px-2.2 rounded transition flex items-center justify-center gap-1"
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
