/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Feed } from './pages/Feed';
import { MoneyFeed } from './pages/MoneyFeed';
import { CyberCrimeFeed } from './pages/CyberCrimeFeed';
import { DarkWebFeed } from './pages/DarkWebFeed';
import { DealsFeed } from './pages/DealsFeed';
import { CompetitionsFeed } from './pages/CompetitionsFeed';
import { GovtSchemesFeed } from './pages/GovtSchemesFeed';
import { IotFeed } from './pages/IotFeed';
import { StartupFeed } from './pages/StartupFeed';
import { OpenSourceFeed } from './pages/OpenSourceFeed';
import { AiEnterpriseFeed } from './pages/AiEnterpriseFeed';
import { CorporateFeed } from './pages/CorporateFeed';
import { InterestHub } from './pages/InterestHub';
import { GeneratedPosts } from './pages/GeneratedPosts';
import { ScheduledQueue } from './pages/ScheduledQueue';
import { SavedNews } from './pages/SavedNews';
import { ReadLater } from './pages/ReadLater';
import { AIChat } from './pages/AIChat';
import { ResourceHub } from './pages/ResourceHub';
import { useLocalStorage } from './hooks/useLocalStorage';
import { GeneratedPost, ScheduledPost } from './types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('feed');
  const [generatedPosts, setGeneratedPosts] = useLocalStorage<GeneratedPost[]>('techbuddy-posts', []);
  const [scheduledPosts, setScheduledPosts] = useLocalStorage<ScheduledPost[]>('techbuddy-scheduled', []);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You are back online! Syncing fresh feed data...");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are currently offline. Displaying cached feeds.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for scheduled posts every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setScheduledPosts(prev => {
        let changed = false;
        const next = prev.map(item => {
          if (item.status === 'pending' && new Date(item.scheduledFor) <= now) {
            changed = true;
            // Trigger notification
            if (Notification.permission === 'granted') {
              new Notification(`TechBuddy: Time to post!`, {
                body: `Your ${item.platform} post is ready to be shared.`,
              });
            }
            toast.info(`Time to share your ${item.platform} post!`, {
              description: item.content.substring(0, 50) + '...',
              duration: 10000,
            });
            return { ...item, status: 'posted' as const };
          }
          return item;
        });
        return changed ? next : prev;
      });
    }, 60000);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, [setScheduledPosts]);

  const handlePostGenerated = (post: GeneratedPost) => {
    setGeneratedPosts(prev => [post, ...prev]);
    setCurrentTab('generated');
  };

  const handleDeletePost = (id: string) => {
    setGeneratedPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleSchedule = (scheduled: ScheduledPost) => {
    setScheduledPosts(prev => [scheduled, ...prev]);
  };

  const handleCancelScheduled = (id: string) => {
    setScheduledPosts(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdatePost = (id: string, newContent: Partial<GeneratedPost>) => {
    setGeneratedPosts(prev => prev.map(p => p.id === id ? { ...p, ...newContent } : p));
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'feed':
        return <Feed onPostGenerated={handlePostGenerated} />;
      case 'community':
      case 'community_marvel':
        return <InterestHub initialCircleTab="marvel" onPostGenerated={handlePostGenerated} />;
      case 'community_riders':
        return <InterestHub initialCircleTab="riders" onPostGenerated={handlePostGenerated} />;
      case 'community_travel':
        return <InterestHub initialCircleTab="travel" onPostGenerated={handlePostGenerated} />;
      case 'community_ngo':
        return <InterestHub initialCircleTab="ngo" onPostGenerated={handlePostGenerated} />;
      case 'community_volunteering':
        return <InterestHub initialCircleTab="volunteering" onPostGenerated={handlePostGenerated} />;
      case 'community_local':
        return <InterestHub initialCircleTab="local" onPostGenerated={handlePostGenerated} />;
      case 'resources':
        return <ResourceHub />;
      case 'money':
        return <MoneyFeed onPostGenerated={handlePostGenerated} />;
      case 'corporate':
        return <CorporateFeed onPostGenerated={handlePostGenerated} />;
      case 'cyber':
        return <CyberCrimeFeed onPostGenerated={handlePostGenerated} />;
      case 'darkweb':
        return <DarkWebFeed onPostGenerated={handlePostGenerated} />;
      case 'deals':
        return <DealsFeed onPostGenerated={handlePostGenerated} />;
      case 'competitions':
        return <CompetitionsFeed onPostGenerated={handlePostGenerated} />;
      case 'schemes':
        return <GovtSchemesFeed onPostGenerated={handlePostGenerated} />;
      case 'iot':
        return <IotFeed onPostGenerated={handlePostGenerated} />;
      case 'startup':
        return <StartupFeed onPostGenerated={handlePostGenerated} />;
      case 'opensource':
        return <OpenSourceFeed onPostGenerated={handlePostGenerated} />;
      case 'ai_enterprise':
        return <AiEnterpriseFeed onPostGenerated={handlePostGenerated} />;
      case 'generated':
        return (
          <GeneratedPosts 
            posts={generatedPosts} 
            onDelete={handleDeletePost} 
            onSchedule={handleSchedule}
            onUpdatePost={handleUpdatePost}
          />
        );
      case 'saved':
        return <SavedNews />;
      case 'readlater':
        return <ReadLater />;
      case 'scheduled':
        return (
          <ScheduledQueue 
            scheduled={scheduledPosts} 
            onCancel={handleCancelScheduled} 
          />
        );
      case 'chat':
        return <AIChat />;
      default:
        return <Feed onPostGenerated={handlePostGenerated} />;
    }
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar currentTab={currentTab} onTabChange={setCurrentTab} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>
            
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200/50 dark:border-emerald-800/30">
                  <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Online Feed Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/65 rounded-full border border-amber-300 dark:border-amber-800/50 animate-pulse">
                  <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Offline Mode (Cached)</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
              </Button>
            </div>
          </header>
          <main className="p-6 max-w-6xl mx-auto w-full">
            {renderContent()}
          </main>
        </SidebarInset>
        <Toaster position="top-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
}

