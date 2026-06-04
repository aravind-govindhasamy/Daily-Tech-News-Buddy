import React, { useState, useEffect } from 'react';
import { DEFAULT_RESOURCES, FeedResource, newsService } from '../services/newsService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Globe, 
  Server, 
  Database, 
  BookOpen, 
  Settings, 
  Wifi, 
  Check, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/FirebaseProvider';

export function ResourceHub() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customCategory, setCustomCategory] = useState('feed');
  const [customFeeds, setCustomFeeds] = useState<FeedResource[]>([]);
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load toggled configurations and custom RSS streams
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load custom feeds
        const custom = await newsService.getCustomFeeds();
        setCustomFeeds(custom);

        // Load toggled map
        const savedEnabledStr = localStorage.getItem('techbuddy_sources_enabled');
        if (savedEnabledStr) {
          setToggles(JSON.parse(savedEnabledStr));
        } else {
          // Default all to true
          const initialMap: Record<string, boolean> = {};
          DEFAULT_RESOURCES.forEach(r => {
            initialMap[r.id] = true;
          });
          setToggles(initialMap);
        }
      } catch (err) {
        console.error('Failure loading sources configuration:', err);
      }
    };
    loadData();
  }, [user]);

  const categories = [
    { value: 'all', label: 'All Channels' },
    { value: 'feed', label: 'Daily Feed' },
    { value: 'money', label: 'Make & Save Money' },
    { value: 'corporate', label: 'Corporate & Career' },
    { value: 'cyber', label: 'Cyber Crime' },
    { value: 'darkweb', label: 'Dark Web & Tor' },
    { value: 'deals', label: 'Deals & Giveaways' },
    { value: 'competitions', label: 'Hackathons & Comps' },
    { value: 'schemes', label: 'Govt Schemes' },
    { value: 'iot', label: 'IoT & Electronics' },
    { value: 'startup', label: 'Startups' },
    { value: 'opensource', label: 'Open Source' },
    { value: 'ai_enterprise', label: 'AI in Enterprise' },
  ];

  const getCategoryLabel = (catKey: string) => {
    return categories.find(c => c.value === catKey)?.label || catKey;
  };

  // Filter default + custom resources
  const allCurrentDefaultResources = DEFAULT_RESOURCES.map(r => ({
    ...r,
    enabled: toggles[r.id] !== false
  }));

  const allCurrentCustomResources = customFeeds.map(r => ({
    ...r,
    enabled: toggles[r.id] !== false
  }));

  const displayedDefaults = allCurrentDefaultResources.filter(r => 
    selectedCategory === 'all' || r.category === selectedCategory
  );

  const displayedCustoms = allCurrentCustomResources.filter(r => 
    selectedCategory === 'all' || r.category === selectedCategory
  );

  // Toggle state
  const handleToggleSource = (sourceId: string, currentState: boolean) => {
    const nextState = !currentState;
    const nextToggles = { ...toggles, [sourceId]: nextState };
    setToggles(nextToggles);
    localStorage.setItem('techbuddy_sources_enabled', JSON.stringify(nextToggles));
    toast.info(`Source feed is now ${nextState ? 'enabled' : 'disabled'}.`);
  };

  // Add Custom Feed
  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      toast.error('Source name is required.');
      return;
    }
    if (!customUrl.trim()) {
      toast.error('RSS Feed URL is required.');
      return;
    }

    // Basic URL validation
    if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
      toast.error('Invalid link address. Must begin with http:// or https://');
      return;
    }

    setIsSubmitting(true);
    try {
      const added = await newsService.addCustomFeed(customName.trim(), customUrl.trim(), customCategory);
      setCustomFeeds(prev => [...prev, added]);
      
      // Default to enabled
      const nextToggles = { ...toggles, [added.id]: true };
      setToggles(nextToggles);
      localStorage.setItem('techbuddy_sources_enabled', JSON.stringify(nextToggles));

      // Reset Form
      setCustomName('');
      setCustomUrl('');
      toast.success('Custom RSS Resource subscribed successfully!');
    } catch (error) {
      toast.error('Failed to save feed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Custom Feed
  const handleDeleteCustom = async (feedId: string) => {
    try {
      await newsService.deleteCustomFeed(feedId);
      setCustomFeeds(prev => prev.filter(f => f.id !== feedId));
      
      // Clean toggle
      const nextToggles = { ...toggles };
      delete nextToggles[feedId];
      setToggles(nextToggles);
      localStorage.setItem('techbuddy_sources_enabled', JSON.stringify(nextToggles));

      toast.success('Custom resource removed');
    } catch (e) {
      toast.error('Failed to remove custom resource');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-7 h-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resource & Feed Hub</h1>
          </div>
          <p className="text-muted-foreground">
            Curate and expand custom feed streams. Toggle default directories, or subscribe to any custom RSS feed.
          </p>
        </div>

        {/* Sync Status Info */}
        <div className="flex items-center gap-2 p-2 px-3 rounded-lg border bg-card text-xs">
          {user ? (
            <>
              <Database className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              <div>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">Cloud Synchronized</p>
                <p className="text-muted-foreground">Changes backup to your Google account</p>
              </div>
            </>
          ) : (
            <>
              <Server className="w-4 h-4 text-amber-500" />
              <div>
                <p className="font-semibold text-amber-600 dark:text-amber-400">Offline Preference Active</p>
                <p className="text-muted-foreground">Locked to local storage. Sign in to sync clouds</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid: 1/3 Form Control --- 2/3 Feed Catalog Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Action to subscribe custom URL */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Plus className="w-5 h-5" />
                <span>Join Custom Feed Stream</span>
              </div>
              <CardDescription>
                Add any public XML/RSS/Atom endpoint to fetch alongside default intelligence sources.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddFeed}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="custom-name">Source Resource Name</Label>
                  <Input 
                    id="custom-name" 
                    placeholder="e.g. My Favorite Dev Blog" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="custom-url">RSS / XML Endpoint Link</Label>
                  <Input 
                    id="custom-url" 
                    type="url" 
                    placeholder="e.g. https://domain.com/feed" 
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="custom-category">Assign to Tab Channel</Label>
                  <Select value={customCategory} onValueChange={setCustomCategory}>
                    <SelectTrigger id="custom-category">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.value !== 'all').map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying Link...' : 'Subscribe Feed'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Quick FAQ info tips */}
          <Card className="border bg-muted/30">
            <CardContent className="p-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-2 font-semibold text-foreground mb-1 text-sm">
                <Settings className="w-4 h-4 text-primary" />
                <span>Curator Guidelines</span>
              </div>
              <p>
                <strong>Feed Formats:</strong> Supported streams include RSS (versions 0.9x, 1.0, 2.0) and Atom syndications.
              </p>
              <p>
                <strong>Cross-Origin Fallbacks:</strong> In case the resource limits CORS permissions, our compiler automatically routes queries through multi-origin proxy cascades to guarantee continuous feed rendering.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: List of Default + Custom Subscriptions with Switches */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls: Category Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Filter Sources:</span>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Catalog Lists Header */}
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <span>Feed Inventory</span>
              <Badge variant="outline">{displayedDefaults.length + displayedCustoms.length} Sources</Badge>
            </h3>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              
              {/* Custom Feeds List first */}
              {displayedCustoms.map((feed) => (
                <motion.div
                  key={feed.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl border bg-primary/5 hover:bg-primary/10 border-primary/20 transition-all shadow-sm relative group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-foreground leading-none">{feed.name}</span>
                        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-indigo-50">Custom Feed</Badge>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {getCategoryLabel(feed.category)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-1 truncate max-w-sm sm:max-w-md">
                        <Globe className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                        <span>{feed.url}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor={`custom-toggle-${feed.id}`} className="text-xs text-muted-foreground font-medium hidden sm:inline">
                          {feed.enabled ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch 
                          id={`custom-toggle-${feed.id}`}
                          checked={feed.enabled}
                          onCheckedChange={() => handleToggleSource(feed.id, feed.enabled)}
                        />
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-full h-8 w-8"
                        onClick={() => handleDeleteCustom(feed.id)}
                        title="Unsubscribe Custom Feed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Default preconfigured feeds list */}
              {displayedDefaults.map((feed) => (
                <motion.div
                  key={feed.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border bg-card transition-all shadow-sm ${
                    feed.enabled ? 'border-border' : 'border-border/30 opacity-60 bg-muted/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base text-foreground truncate">{feed.name}</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0 tracking-wider">
                          {getCategoryLabel(feed.category)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feed.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-semibold leading-none font-mono text-muted-foreground">
                        <a 
                          href={feed.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-primary hover:underline flex items-center gap-1"
                        >
                          <span>Endpoint URL</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={`default-toggle-${feed.id}`} className="text-xs text-muted-foreground font-medium hidden sm:inline">
                        {feed.enabled ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch 
                        id={`default-toggle-${feed.id}`}
                        checked={feed.enabled}
                        onCheckedChange={() => handleToggleSource(feed.id, feed.enabled)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty state callback */}
              {displayedDefaults.length === 0 && displayedCustoms.length === 0 && (
                <div className="p-8 text-center rounded-xl border border-dashed bg-muted/10 text-muted-foreground space-y-2">
                  <AlertCircle className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                  <p className="font-medium text-base">No registered sources in this channel.</p>
                  <p className="text-xs">Select a different tab or add your custom feed resource stream.</p>
                </div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
