import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Coins, 
  Clipboard,
  ExternalLink,
  Loader2,
  Trash2,
  Heart,
  Check
} from 'lucide-react';
import { EVENTS, INITIAL_POSTS } from '../../services/communityData';
import { EventItem, CommunityPost } from '../../types/community';
import { NewsItem } from '../../types';
import { newsService } from '../../services/newsService';
import { geminiService } from '../../services/geminiService';
import { toast } from 'sonner';

interface LocalTabProps {
  onAddPost: (content: string, subcategory: string) => void;
  onAddPoints: (points: number) => void;
  onPostGenerated: (post: any) => void;
}

export function LocalTab({
  onAddPost,
  onAddPoints,
  onPostGenerated
}: LocalTabProps) {
  const [localEvents, setLocalEvents] = useState<EventItem[]>(
    EVENTS.filter(e => e.category === 'local')
  );

  // Photo uploads mock state
  const [uploadCaption, setUploadCaption] = useState('');
  const [selectedWalk, setSelectedWalk] = useState('Golden Hour Shadows');
  const [photosList, setPhotosList] = useState<any[]>([
    { id: 'p1', author: 'Shutter_Vibe', url: 'https://images.unsplash.com/photo-1452421820245-172192da2b6a?w=400&fit=crop&q=80', caption: 'Deep architectural shadows near the retro brick warehouse.', likes: 45 },
    { id: 'p2', author: 'Visual_Creator', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop&q=80', caption: 'Lighthouse turnoff reflection at dawn.', likes: 23 }
  ]);

  // Scraped RSS news
  const [scrapedNews, setScrapedNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocalLive() {
      setLoadingNews(true);
      try {
        const data = await newsService.getLocalSquadsNews(false);
        setScrapedNews(data);
      } catch (err) {
        console.warn('Error loading live local squads news:', err);
      } finally {
        setLoadingNews(false);
      }
    }
    loadLocalLive();
  }, []);

  const handleRsvp = (eventId: string) => {
    setLocalEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const enrolled = !e.userRsvp;
        if (enrolled) {
          onAddPoints(80);
          toast.success('Joined photowalk meetup group! +80 Points.');
        } else {
          toast.info('Cancelled RSVP.');
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

  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCaption.trim()) return;

    // Use a preselected high quality Unsplash photo
    const imageOptions = [
      'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534751516642-a131ffd473fd?w=400&fit=crop&q=80'
    ];
    const chosenUrl = imageOptions[Math.floor(Math.random() * imageOptions.length)];

    const newPhoto = {
      id: crypto.randomUUID(),
      author: 'My_Shutter_Self',
      url: chosenUrl,
      caption: `${uploadCaption} [Photowalk: ${selectedWalk}]`,
      likes: 1
    };

    setPhotosList([newPhoto, ...photosList]);
    onAddPoints(40);
    toast.success('Visual contribution uploaded! (+40 Points earned)');
    setUploadCaption('');
  };

  const likePhoto = (photoId: string) => {
    setPhotosList(prev => prev.map(p => {
      if (p.id === photoId) {
        onAddPoints(5);
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    }));
    toast.success('Liked! +5 Loyalty Points awarded.');
  };

  const handleGeneratePost = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const result = await geminiService.generateSocialPosts(
        item.id,
        item.title,
        item.summary || '',
        item.source || 'Photo Trends',
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
      toast.success('Copied social draft!');
    } catch (err) {
      toast.error('Failed to translate photographic insights.');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Photowalk submissions uploader visual panel */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-500" /> Shutter Walk Showcase
          </h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" /> Earn 40 points / photo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={handleUploadPhoto} className="space-y-3.5 md:col-span-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Walk Album Channel</label>
              <select
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={selectedWalk}
                onChange={(e) => setSelectedWalk(e.target.value)}
              >
                <option value="Golden Hour Shadows">🌆 Golden Hour Shadows</option>
                <option value="Cyber Neon Nightscape">🌃 Cyber Neon Nightscapes</option>
                <option value="Raw Steel & Factories">🏭 Raw Steel & Factories</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Camera & Composition Notes</label>
              <textarea
                placeholder="e.g. Captured with 50mm f/1.8 lens setting. Post-processed under cold tones."
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[70px] resize-none"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              <Camera className="w-3.5 h-3.5" /> Post Photo Walk Shot
            </button>
          </form>

          {/* Album submission showcase strip */}
          <div className="md:col-span-2 border border-border/40 rounded-lg p-3.5 bg-muted/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photosList.map(photo => (
              <div key={photo.id} className="rounded-lg overflow-hidden border border-border bg-background flex flex-col justify-between p-2 shadow-sm">
                <div className="h-28 rounded overflow-hidden border border-border/30 mb-2 relative">
                  <img src={photo.url} alt="Walk shot" className="w-full h-full object-cover" />
                  <span className="absolute top-1.5 left-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[8.5px] text-zinc-100 font-bold uppercase">
                    @{photo.author}
                  </span>
                </div>
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <p className="line-clamp-2 text-slate-800 dark:text-zinc-200">{photo.caption}</p>
                  <button
                    onClick={() => likePhoto(photo.id)}
                    className="flex items-center gap-1.5 text-pink-600 font-bold hover:underline"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" /> <span>{photo.likes} Likes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Photo meetups & Live Scraped camera trends news */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Walk Meetup schedules */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 border-b border-border/50 pb-2">
            <Calendar className="w-4 h-4 text-indigo-500" /> Scheduled Photo Meetups
          </h3>

          <div className="space-y-4">
            {localEvents.map(event => (
              <div key={event.id} className="p-3.5 rounded-lg border border-border/40 bg-muted/10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground/95">{event.title}</h4>
                  <span className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded border dark:bg-indigo-950/40 dark:text-indigo-400">
                    +{event.rewardPoints} Pts
                  </span>
                </div>

                <p className="text-muted-foreground text-[11.5px] leading-relaxed">{event.description}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {event.date} | {event.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {event.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-indigo-500" /> {event.attendeeCount} spots claimed</span>
                </div>

                <button
                  onClick={() => handleRsvp(event.id)}
                  className={`w-full font-bold py-1.8 rounded-md text-xs transition flex items-center justify-center gap-2 ${
                    event.userRsvp
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {event.userRsvp ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" /> RSVP Registered / Claim Reward
                    </>
                  ) : (
                    'Claim Walk Ticket'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Real Live Scraped photographic gear trends */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" /> Scraped Photo & Lens Intel
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
              <p className="text-xs text-muted-foreground">The Photography feed could not be collected instantly.</p>
              <button
                onClick={async () => {
                  setLoadingNews(true);
                  const data = await newsService.getLocalSquadsNews(true);
                  if (data && data.length > 0) setScrapedNews(data);
                  setLoadingNews(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white border-indigo-500 border rounded-lg px-4 py-2 font-semibold"
              >
                🔄 Retry Fetching Feeds
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {scrapedNews.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 bg-muted/5 border border-border/40 rounded-lg space-y-2 hover:bg-muted/15 transition-all text-xs">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-bold text-indigo-700">{item.source || 'DIY Photography'}</span>
                    <span className="bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-mono uppercase text-[9px] dark:bg-indigo-950/40 dark:text-indigo-400">
                      Scraped
                    </span>
                  </div>
                  
                  <h4 className="font-bold leading-tight text-[12px] text-foreground/95">{item.title}</h4>
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
