import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { Trophy } from 'lucide-react';

export function CompetitionsFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Hackathons & Competitions"
      description="Upcoming hackathons, coding competitions, and game jams."
      icon={<Trophy className="w-6 h-6 text-purple-500" />}
      fetchAction={newsService.getCompetitionNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200"
      buttonClass="bg-purple-600 hover:bg-purple-700 text-white"
      cardClass="border-purple-500/20"
    />
  );
}
