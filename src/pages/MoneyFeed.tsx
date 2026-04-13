import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';

export function MoneyFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Make & Save Money"
      description="Daily tips on side hustles, saving, and making money online."
      fetchAction={newsService.getMoneyNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      buttonClass="bg-green-600 hover:bg-green-700 text-white"
    />
  );
}
