import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { Code } from 'lucide-react';

export function OpenSourceFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Open Source"
      description="Latest releases, updates, and news from the open source community."
      icon={<Code className="w-6 h-6 text-emerald-500" />}
      fetchAction={newsService.getOpenSourceNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
      buttonClass="bg-emerald-600 hover:bg-emerald-700 text-white"
      cardClass="border-emerald-500/20"
    />
  );
}
