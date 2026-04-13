import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';

export function Feed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Daily Tech Feed"
      description="Stay updated with the latest in tech and IoT."
      fetchAction={newsService.getTopNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-secondary text-secondary-foreground hover:bg-secondary/80"
    />
  );
}
