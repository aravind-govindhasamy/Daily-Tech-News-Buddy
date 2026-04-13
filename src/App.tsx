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
import { DealsFeed } from './pages/DealsFeed';
import { CompetitionsFeed } from './pages/CompetitionsFeed';
import { GovtSchemesFeed } from './pages/GovtSchemesFeed';
import { GeneratedPosts } from './pages/GeneratedPosts';
import { ScheduledQueue } from './pages/ScheduledQueue';
import { AIChat } from './pages/AIChat';
import { useLocalStorage } from './hooks/useLocalStorage';
import { GeneratedPost, ScheduledPost } from './types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  const [currentTab, setCurrentTab] = useState('feed');
  const [generatedPosts, setGeneratedPosts] = useLocalStorage<GeneratedPost[]>('techbuddy-posts', []);
  const [scheduledPosts, setScheduledPosts] = useLocalStorage<ScheduledPost[]>('techbuddy-scheduled', []);

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

  const renderContent = () => {
    switch (currentTab) {
      case 'feed':
        return <Feed onPostGenerated={handlePostGenerated} />;
      case 'money':
        return <MoneyFeed onPostGenerated={handlePostGenerated} />;
      case 'cyber':
        return <CyberCrimeFeed onPostGenerated={handlePostGenerated} />;
      case 'deals':
        return <DealsFeed onPostGenerated={handlePostGenerated} />;
      case 'competitions':
        return <CompetitionsFeed onPostGenerated={handlePostGenerated} />;
      case 'schemes':
        return <GovtSchemesFeed onPostGenerated={handlePostGenerated} />;
      case 'generated':
        return (
          <GeneratedPosts 
            posts={generatedPosts} 
            onDelete={handleDeletePost} 
            onSchedule={handleSchedule} 
          />
        );
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
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

