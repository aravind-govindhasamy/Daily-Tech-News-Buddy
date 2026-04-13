import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { Tag } from 'lucide-react';

export function DealsFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Deals & Giveaways"
      description="Latest freebies, coupons, and giveaways across the web."
      icon={<Tag className="w-6 h-6 text-orange-500" />}
      fetchAction={newsService.getDealsNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200"
      buttonClass="bg-orange-600 hover:bg-orange-700 text-white"
      cardClass="border-orange-500/20"
    />
  );
}
