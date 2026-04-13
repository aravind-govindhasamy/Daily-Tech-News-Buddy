import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { Landmark } from 'lucide-react';

export function GovtSchemesFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Govt Schemes & Subsidies"
      description="Latest updates on Indian and TN Govt schemes, subsidies, and free benefits."
      icon={<Landmark className="w-6 h-6 text-blue-500" />}
      fetchAction={newsService.getGovtSchemesNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
      buttonClass="bg-blue-600 hover:bg-blue-700 text-white"
      cardClass="border-blue-500/20"
    />
  );
}
