import { useState } from 'react';
import { SharedFeed } from '../components/SharedFeed';
import { newsService } from '../services/newsService';
import { GeneratedPost } from '../types';
import { Briefcase, Calculator, Newspaper } from 'lucide-react';
import { SalaryCalculator } from '../components/SalaryCalculator';
import { Button } from '@/components/ui/button';

export function CorporateFeed({ onPostGenerated }: { onPostGenerated: (post: GeneratedPost) => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'calculator'>('feed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex bg-muted p-1 rounded-lg gap-1">
          <Button
            variant={activeSubTab === 'feed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSubTab('feed')}
            className="flex items-center gap-1.5 text-xs h-8"
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Career Feed</span>
          </Button>
          <Button
            variant={activeSubTab === 'calculator' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSubTab('calculator')}
            className="flex items-center gap-1.5 text-xs h-8"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Salary & Increment Estimator</span>
          </Button>
        </div>
      </div>

      <div>
        {activeSubTab === 'feed' ? (
          <SharedFeed
            title="Corporate & Career Hub"
            description="Stay updated with company cultures, job & hiring trends, salary negotiations, increment strategies, office politics navigation, and workspace career tips."
            icon={<Briefcase className="w-6 h-6 text-emerald-500" />}
            fetchAction={newsService.getCorporateNews}
            onPostGenerated={onPostGenerated}
            badgeClass="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
            buttonClass="bg-emerald-600 hover:bg-emerald-700 text-white"
            cardClass="border-emerald-500/20"
          />
        ) : (
          <SalaryCalculator />
        )}
      </div>
    </div>
  );
}

