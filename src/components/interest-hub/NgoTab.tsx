import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  MapPin, 
  Coins, 
  DollarSign, 
  Globe,
  ExternalLink,
  Loader2,
  Check
} from 'lucide-react';
import { NGOs } from '../../services/communityData';
import { NGOItem } from '../../types/community';
import { NewsItem } from '../../types';
import { newsService } from '../../services/newsService';
import { geminiService } from '../../services/geminiService';
import { toast } from 'sonner';

interface NgoTabProps {
  onAddPoints: (points: number) => void;
  onPostGenerated: (post: any) => void;
}

export function NgoTab({
  onAddPoints,
  onPostGenerated
}: NgoTabProps) {
  const [localNgos, setLocalNgos] = useState<NGOItem[]>(NGOs);
  const [activeNgo, setActiveNgo] = useState<NGOItem>(localNgos[0]);

  // Scraped RSS news
  const [scrapedNews, setScrapedNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadNgosLive() {
      setLoadingNews(true);
      try {
        const data = await newsService.getNgoNews(false);
        setScrapedNews(data);
      } catch (err) {
        console.warn('Error loading live NGO news:', err);
      } finally {
        setLoadingNews(false);
      }
    }
    loadNgosLive();
  }, []);

  const handleDonate = (ngoId: string, amount: number) => {
    setLocalNgos(prev => prev.map(n => {
      if (n.id === ngoId) {
        const afterRaised = n.donationRaised + amount;
        onAddPoints(amount * 5);
        toast.success(`Donation of $${amount} sent! Thank you! (+${amount * 5} points accumulated)`);
        
        const updated = {
          ...n,
          donationRaised: afterRaised
        };
        // Keep active selection in sync
        if (activeNgo.id === ngoId) {
          setActiveNgo(updated);
        }
        return updated;
      }
      return n;
    }));
  };

  const handleGeneratePost = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const result = await geminiService.generateSocialPosts(
        item.id,
        item.title,
        item.summary || '',
        item.source || 'Charity News',
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
      toast.success('Social promo posts drafted!');
    } catch (err) {
      toast.error('Failed to translate and compile neural post.');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Interactive Funding Progress Bar and Branch Plotter */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-pink-500" /> Ground Roots Charity Funds
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-1">
            {localNgos.map(ngo => (
              <button
                key={ngo.id}
                onClick={() => setActiveNgo(ngo)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-3 transition ${
                  activeNgo.id === ngo.id
                  ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400'
                  : 'border-border/40 bg-background/50 hover:bg-muted'
                }`}
              >
                <span className="text-xl">{ngo.logo}</span>
                <div className="truncate">
                  <span className="font-bold block">{ngo.name}</span>
                  <span className="text-[10px] text-muted-foreground block">{ngo.focus}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Core Interactive Donation Metrics */}
          <div className="md:col-span-2 border border-border/40 rounded-xl p-5 bg-muted/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-pink-500 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded dark:bg-pink-950/40 dark:text-pink-400">
                  Active Campaign
                </span>
                <h4 className="font-bold text-sm text-foreground mt-1.5">{activeNgo.name}</h4>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeNgo.description}
              </p>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>Raised: ${activeNgo.donationRaised.toLocaleString()}</span>
                  <span className="text-muted-foreground">Goal: ${activeNgo.donationGoal.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden relative border border-border/30">
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-pink-500 transition-all duration-500 rounded-full" 
                    style={{ width: `${Math.min((activeNgo.donationRaised / activeNgo.donationGoal) * 100, 100)}%` }} 
                  />
                </div>
              </div>

              {/* Quick Donation triggers */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleDonate(activeNgo.id, 10)}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-1.8 rounded-lg text-xs shadow transition flex items-center justify-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Donate $10
                </button>
                <button
                  onClick={() => handleDonate(activeNgo.id, 50)}
                  className="flex-1 border border-pink-500 text-pink-600 dark:text-pink-400 font-bold py-1.8 rounded-lg text-xs hover:bg-pink-500/10 transition flex items-center justify-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Donate $50
                </button>
              </div>
            </div>

            {/* SVG Branch Pointers map representing coordinates */}
            <div className="border border-border/40 rounded-lg p-3.5 bg-background flex flex-col justify-between min-h-[190px]">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-500" /> Active Operations Area
              </span>

              <div className="relative w-full h-[100px] border border-border/30 rounded bg-muted/25 overflow-hidden flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full opacity-65 p-4">
                  <rect width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx={`${activeNgo.lat}%`} cy={`${activeNgo.lng}%`} r="30" fill="rgba(219, 39, 119, 0.08)" stroke="rgba(219, 39, 119, 0.25)" strokeWidth="1" />
                  <circle cx={`${activeNgo.lat}%`} cy={`${activeNgo.lng}%`} r="6" fill="#db2777" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
                <div className="absolute text-[8.5px] bg-black/75 px-1.5 py-0.5 rounded text-white font-sans bottom-1.5 left-1.5">
                  📍 Branch: {activeNgo.officeLocation}
                </div>
              </div>

              <span className="text-[10px] text-muted-foreground italic leading-tight">
                *Office coordinates mapped dynamically. Volunteers required: {activeNgo.volunteersNeeded} slots.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real Live Scraped Charity news feed */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" /> Scraped Charity & Sustainability News
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
            <p className="text-xs text-muted-foreground">The NGO feed could not be collected instantly.</p>
            <button
              onClick={async () => {
                setLoadingNews(true);
                const data = await newsService.getNgoNews(true);
                if (data && data.length > 0) setScrapedNews(data);
                setLoadingNews(false);
              }}
              className="bg-pink-600 hover:bg-pink-700 text-xs text-white border-pink-500 border rounded-lg px-4 py-2 font-semibold"
            >
              🔄 Retry Fetching Feeds
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {scrapedNews.slice(0, 5).map((item) => (
              <div key={item.id} className="p-3 bg-muted/5 border border-border/40 rounded-lg space-y-2 hover:bg-muted/15 transition-all text-xs">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-bold text-pink-700">{item.source || 'NonProfit PRO'}</span>
                  <span className="bg-pink-50 text-pink-800 px-1.5 py-0.5 rounded font-mono uppercase text-[9px] dark:bg-pink-950/40 dark:text-pink-400">
                    Scraped
                  </span>
                </div>
                
                <h4 className="font-bold leading-tight text-[12px] text-foreground/95">{item.title}</h4>
                <p className="line-clamp-2 text-muted-foreground text-[11px] leading-relaxed">{item.summary}</p>
                
                <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                  <button
                    onClick={() => handleGeneratePost(item)}
                    disabled={generatingId === item.id}
                    className="flex-1 bg-pink-600/10 hover:bg-pink-600 text-pink-700 hover:text-white text-[10px] font-bold py-1 px-2.2 rounded transition flex items-center justify-center gap-1"
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
  );
}
