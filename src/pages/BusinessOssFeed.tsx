import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { Building2 } from 'lucide-react';

export function BusinessOssFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Business Open Source"
      description="Trending applications, ERPs, and open source solutions for businesses."
      icon={<Building2 className="w-6 h-6 text-indigo-500" />}
      fetchAction={newsService.getBusinessOssNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200"
      buttonClass="bg-indigo-600 hover:bg-indigo-700 text-white"
      cardClass="border-indigo-500/20"
    />
  );
}
