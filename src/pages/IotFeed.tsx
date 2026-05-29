import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { Cpu } from 'lucide-react';

export function IotFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="IoT & Electronics"
      description="Latest updates in IoT, AIoT, hardware, and electronics."
      icon={<Cpu className="w-6 h-6 text-teal-500" />}
      fetchAction={newsService.getIotNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-teal-100 text-teal-800 hover:bg-teal-100 border-teal-200"
      buttonClass="bg-teal-600 hover:bg-teal-700 text-white"
      cardClass="border-teal-500/20"
    />
  );
}
