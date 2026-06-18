import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Loader2, TrendingUp, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { newsService } from '../services/newsService';
import { NewsItem } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'is', 'in', 'at', 'of', 'on', 'and', 'a', 'to', 'for', 'with', 'as', 'by', 'an', 'that', 'this',
  'it', 'from', 'are', 'was', 'were', 'or', 'be', 'how', 'what', 'who', 'where', 'why', 'when', 'which',
  'about', 'new', 'you', 'your', 'i', 'my', 'we', 'our', 'has', 'have', 'had', 'not', 'no', 'can', 'will',
  'up', 'out', 'more', 'their', 'they', 'its', 'all', 'one', 'two', 'after', 'over', 'into', 'first',
  'time', 'just', 'now', 'top', 'best', 'get', 'make', 'do', 'does', 'did', 'some', 'any', 'could', 'would'
]);

export function TrendsDashboard() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ word: string; count: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [totalItemsCount, setTotalItemsCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        // Fetch a cross-section of feeds
        const allItemsList = await Promise.allSettled([
          newsService.getTopNews(),
          newsService.getMoneyNews(),
          newsService.getCyberNews(),
          newsService.getAiEnterpriseNews(),
          newsService.getStartupNews(),
          newsService.getMarvelNews()
        ]);

        const allNewsItems: NewsItem[] = [];
        allItemsList.forEach(res => {
          if (res.status === 'fulfilled' && Array.isArray(res.value)) {
            allNewsItems.push(...res.value);
          }
        });

        if (!mounted) return;

        setTotalItemsCount(allNewsItems.length);

        // Analyze topics (words in titles)
        const wordCounts: Record<string, number> = {};
        const sourceCounts: Record<string, number> = {};

        allNewsItems.forEach(item => {
          // Count categories / sources
          const src = item.source || 'Unknown';
          sourceCounts[src] = (sourceCounts[src] || 0) + 1;

          // Analyze title for topics
          if (item.title) {
            const words = item.title
              .toLowerCase()
              .replace(/[^\w\s]/g, '')
              .split(/\s+/);

            words.forEach(word => {
              if (word.length > 3 && !STOP_WORDS.has(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
              }
            });
          }
        });

        const sortedWords = Object.entries(wordCounts)
          .map(([word, count]) => ({ word, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15);

        const sortedSources = Object.entries(sourceCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8); // top 8 sources

        setChartData(sortedWords);
        setCategoryData(sortedSources);
      } catch (e) {
        console.error('Failed to load trends data', e);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Trends Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            A real-time visualization of popular topics across {totalItemsCount > 0 ? totalItemsCount : 'various'} latest articles.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Aggregating trends data across feeds...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <CardTitle className="text-base text-foreground">Most Discussed Topics</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Keyword frequency analysis across active news titles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                      <XAxis 
                        dataKey="word" 
                        tick={{ fontSize: 11, fill: 'currentColor' }} 
                        className="opacity-60"
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="opacity-60" />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(var(--background), 0.95)', 
                          border: '1px solid rgba(var(--border), 1)',
                          borderRadius: '8px',
                          color: 'currentColor'
                        }}
                        itemStyle={{ color: 'currentColor' }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="currentColor" 
                        className="fill-primary" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-500" />
                <CardTitle className="text-base text-foreground">Top News Sources</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Distribution of articles by source origin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(var(--background), 0.95)', 
                          border: '1px solid rgba(var(--border), 1)',
                          borderRadius: '8px',
                          color: 'currentColor'
                        }}
                        itemStyle={{ color: 'currentColor' }}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center" 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
