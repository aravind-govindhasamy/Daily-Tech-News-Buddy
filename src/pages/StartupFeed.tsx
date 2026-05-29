import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { Rocket } from 'lucide-react';

export function StartupFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Indian Startup News"
      description="Funding rounds, acquisitions, and startup ecosystem news from India."
      icon={<Rocket className="w-6 h-6 text-indigo-500" />}
      fetchAction={newsService.getStartupNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200"
      buttonClass="bg-indigo-600 hover:bg-indigo-700 text-white"
      cardClass="border-indigo-500/20"
    />
  );
}
