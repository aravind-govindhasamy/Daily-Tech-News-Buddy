import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Coins, 
  FileText,
  Loader2,
  ExternalLink,
  Plus,
  TrendingUp,
  Check
} from 'lucide-react';
import { EVENTS } from '../../services/communityData';
import { EventItem } from '../../types/community';
import { NewsItem } from '../../types';
import { newsService } from '../../services/newsService';
import { geminiService } from '../../services/geminiService';
import { toast } from 'sonner';

interface VolunteeringTabProps {
  onAddPoints: (points: number) => void;
  onPostGenerated: (post: any) => void;
}

export function VolunteeringTab({
  onAddPoints,
  onPostGenerated
}: VolunteeringTabProps) {
  const [localEvents, setLocalEvents] = useState<EventItem[]>(
    EVENTS.filter(e => e.category === 'volunteering')
  );

  // Hours logger states
  const [logTask, setLogTask] = useState('');
  const [logHours, setLogHours] = useState('');
  const [loggedTrips, setLoggedTrips] = useState<any[]>([
    { task: 'Supply Packing & Logistics Support', hours: 4, date: '2026-05-28', status: 'Approved' },
    { task: 'Blood Donation Clinic Registrar', hours: 3, date: '2026-05-30', status: 'Approved' }
  ]);

  // Scraped RSS news
  const [scrapedNews, setScrapedNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadVolunteeringLive() {
      setLoadingNews(true);
      try {
        const data = await newsService.getVolunteeringNews(false);
        setScrapedNews(data);
      } catch (err) {
        console.warn('Error loading live volunteering news:', err);
      } finally {
        setLoadingNews(false);
      }
    }
    loadVolunteeringLive();
  }, []);

  const handleRsvp = (eventId: string) => {
    setLocalEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const enrolled = !e.userRsvp;
        if (enrolled) {
          onAddPoints(150);
          toast.success('Joined Emergency Corps volunteer program! +150 Points added.');
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

  const handleLogHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTask.trim() || !logHours) return;
    const hoursNum = parseInt(logHours);
    if (isNaN(hoursNum) || hoursNum <= 0) return;

    const newTrip = {
      task: logTask,
      hours: hoursNum,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Verification'
    };
    setLoggedTrips(prev => [newTrip, ...prev]);
    onAddPoints(hoursNum * 25);
    toast.success(`Logged ${hoursNum} hours successfully! Got +${hoursNum * 25} points.`);
    setLogTask('');
    setLogHours('');
  };

  const handleGeneratePost = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const result = await geminiService.generateSocialPosts(
        item.id,
        item.title,
        item.summary || '',
        item.source || 'Volunteer News',
        'professional'
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
        tone: 'professional',
        createdAt: new Date().toISOString()
      };
      onPostGenerated(newPost);
      toast.success('Social promo posts drafted successfully!');
    } catch (err) {
      toast.error('Failed to translate and compile neural post.');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Hours Verification Logger & Metrics */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Volunteer Hours Logger
          </h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" /> Earn 25 points / logged hour
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleLogHoursSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Shift / Tasks Name</label>
              <input
                type="text"
                placeholder="e.g., Prepared meal kits at Shelter Kitchen"
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={logTask}
                onChange={(e) => setLogTask(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Hours Volunteered</label>
              <input
                type="number"
                placeholder="e.g., 4"
                min="1"
                max="24"
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={logHours}
                onChange={(e) => setLogHours(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Submit for Approval
            </button>
          </form>

          {/* List of logged trips */}
          <div className="border border-border/40 rounded-lg p-3.5 bg-muted/10 flex flex-col justify-between text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Verified Logbooks
              </h4>
              
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {loggedTrips.map((trip, idx) => (
                  <div key={idx} className="p-2.5 rounded border border-border/40 bg-background flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-zinc-200">{trip.task}</span>
                      <span className="text-[10px] text-muted-foreground">{trip.date} | {trip.hours} hrs</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      trip.status === 'Approved' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Emergency Tasks & Real Live Scraped volunteering updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Task schedule */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 border-b border-border/50 pb-2">
            <Calendar className="w-4 h-4 text-indigo-500" /> Emergency Response Tasks
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
                
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-medium pb-1.5">
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
                    'Claim Shift Shift & Check-In'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Real Live Scraped Volunteering news feed */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-indigo-500" /> Scraped Volunteering Service News
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
              <p className="text-xs text-muted-foreground">The Volunteering feed could not be fetched instantly.</p>
              <button
                onClick={async () => {
                  setLoadingNews(true);
                  const data = await newsService.getVolunteeringNews(true);
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
                    <span className="font-bold text-indigo-700">{item.source || 'AmeriCorps'}</span>
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
