import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sun, Copy, Share2, CheckCircle2 } from 'lucide-react';
import { newsService } from '../services/newsService';
import { NewsItem } from '../types';
import { toast } from 'sonner';

interface NewsletterSection {
  title: string;
  items: NewsItem[];
}

export function DailySummary() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<NewsletterSection[]>([]);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNewsletterData() {
      setLoading(true);
      try {
        const [
          topRes,
          aiRes,
          cyberRes,
          startupRes
        ] = await Promise.allSettled([
          newsService.getTopNews(),
          newsService.getAiEnterpriseNews(),
          newsService.getCyberNews(),
          newsService.getStartupNews()
        ]);

        if (!mounted) return;

        const newSections: NewsletterSection[] = [];

        if (topRes.status === 'fulfilled' && topRes.value.length > 0) {
          newSections.push({
            title: 'Top Headlines',
            items: topRes.value.slice(0, 3)
          });
        }
        if (aiRes.status === 'fulfilled' && aiRes.value.length > 0) {
          newSections.push({
            title: 'AI & Enterprise',
            items: aiRes.value.slice(0, 3)
          });
        }
        if (startupRes.status === 'fulfilled' && startupRes.value.length > 0) {
          newSections.push({
            title: 'Startups & Funding',
            items: startupRes.value.slice(0, 2)
          });
        }
        if (cyberRes.status === 'fulfilled' && cyberRes.value.length > 0) {
          newSections.push({
            title: 'Cybersecurity',
            items: cyberRes.value.slice(0, 2)
          });
        }

        setSections(newSections);
      } catch (err) {
        console.error("Failed to load newsletter data", err);
        toast.error("Failed to generate morning briefing.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadNewsletterData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCopyNewsletter = async () => {
    if (!contentRef.current) return;
    
    try {
      // Create a markdown-like text version for clipboard
      let textContent = `🌅 TechBuddy Morning Briefing\n📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
      
      sections.forEach(section => {
        textContent += `== ${section.title} ==\n\n`;
        section.items.forEach(item => {
          textContent += `• ${item.title}\n`;
          if (item.summary) {
            textContent += `  ${item.summary.length > 100 ? item.summary.substring(0, 100) + '...' : item.summary}\n`;
          }
          textContent += `  Read more: ${item.url}\n\n`;
        });
      });

      textContent += `\nStay informed with TechBuddy! 🚀`;

      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      toast.success("Newsletter copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
      toast.error("Failed to copy text.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TechBuddy Morning Briefing',
          text: "Check out today's top tech news highlights!",
          url: window.location.href,
        });
      } catch (err) {
        console.warn('Error sharing', err);
      }
    } else {
      handleCopyNewsletter();
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Morning Briefing</h1>
            <p className="text-sm text-muted-foreground">Your daily tech summary for {todayStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyNewsletter}>
            {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied' : 'Copy Text'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Compiling today's briefing...</p>
        </div>
      ) : sections.length === 0 ? (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Sun className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No news available for today's briefing.</p>
          </CardContent>
        </Card>
      ) : (
        <div 
          className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden" 
          ref={contentRef}
        >
          {/* Newsletter Header */}
          <div className="bg-primary/5 text-center py-10 px-6 border-b">
            <h2 className="text-4xl font-serif font-bold tracking-tight mb-2 text-foreground">The TechBuddy Brief</h2>
            <p className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">{todayStr}</p>
          </div>

          <div className="p-6 sm:p-10 space-y-12">
            {sections.map((section, idx) => (
              <section key={idx} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold font-serif text-foreground shrink-0">{section.title}</h3>
                  <div className="h-px bg-border flex-1 w-full" />
                </div>
                
                <div className="space-y-8">
                  {section.items.map((item, itemIdx) => (
                    <article key={item.id || itemIdx} className="group">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block space-y-2">
                        <h4 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{item.source || 'Tech News'}</span>
                          <span>•</span>
                          <span>{new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {item.summary && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {item.summary.replace(/<[^>]+>/g, '')}
                          </p>
                        )}
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Newsletter Footer */}
          <div className="bg-muted/30 p-8 text-center border-t">
            <div className="inline-flex items-center justify-center p-3 bg-background rounded-full border mb-4 shadow-sm">
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Have a productive day!</p>
            <p className="text-xs text-muted-foreground mt-1">Generated by TechBuddy AI</p>
          </div>
        </div>
      )}
    </div>
  );
}
