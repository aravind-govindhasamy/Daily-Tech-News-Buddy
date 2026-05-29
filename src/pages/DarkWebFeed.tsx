import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { EyeOff } from 'lucide-react';

export function DarkWebFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Dark Web & Tor Network"
      description="Monitor onion services, privacy technologies, Tor browser updates, dark net alerts, and threat intelligence reports."
      icon={<EyeOff className="w-6 h-6 text-indigo-500" />}
      fetchAction={newsService.getDarkWebNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 border-indigo-200"
      buttonClass="bg-indigo-600 hover:bg-indigo-700 text-white"
      cardClass="border-indigo-500/20"
    />
  );
}
