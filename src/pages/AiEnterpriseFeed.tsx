import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { Bot } from 'lucide-react';

export function AiEnterpriseFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="AI in Enterprise"
      description="Latest updates on artificial intelligence in business and enterprise."
      icon={<Bot className="w-6 h-6 text-indigo-500" />}
      fetchAction={newsService.getAiEnterpriseNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200"
      buttonClass="bg-indigo-600 hover:bg-indigo-700 text-white"
      cardClass="border-indigo-500/20"
    />
  );
}
