import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { ShieldAlert } from 'lucide-react';

export function CyberCrimeFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  return (
    <SharedFeed
      title="Cyber Crime & Incidents"
      description="Real-world cyber attacks, arrests, and security incidents."
      icon={<ShieldAlert className="w-6 h-6 text-destructive" />}
      fetchAction={newsService.getCyberNews}
      onPostGenerated={onPostGenerated}
      badgeClass="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
      buttonClass="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      cardClass="border-destructive/20"
    />
  );
}
