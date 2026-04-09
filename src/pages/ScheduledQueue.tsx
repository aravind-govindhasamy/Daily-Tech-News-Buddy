import { ScheduledPost } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Linkedin, 
  Twitter,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface ScheduledQueueProps {
  scheduled: ScheduledPost[];
  onCancel: (id: string) => void;
}

export function ScheduledQueue({ scheduled, onCancel }: ScheduledQueueProps) {
  const sortedScheduled = [...scheduled].sort((a, b) => 
    new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );

  if (scheduled.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-6 bg-muted rounded-full">
          <Calendar className="w-12 h-12 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">No scheduled posts</h2>
          <p className="text-muted-foreground">Schedule some posts from the Generated Content page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheduled Queue</h1>
        <p className="text-muted-foreground">Manage your upcoming social media posts.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedScheduled.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card className={item.status === 'posted' ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        {item.platform === 'linkedin' ? (
                          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                            <Linkedin className="w-3 h-3" /> LinkedIn
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 bg-sky-50 text-sky-700 border-sky-200">
                            <Twitter className="w-3 h-3" /> Twitter/X
                          </Badge>
                        )}
                        <Badge variant={item.status === 'pending' ? 'secondary' : 'default'} className="flex items-center gap-1">
                          {item.status === 'pending' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {item.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm font-medium line-clamp-2 italic text-muted-foreground">
                        "{item.content}"
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(item.scheduledFor), 'PPP')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(item.scheduledFor), 'p')}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {item.status === 'pending' && (
                        <Button variant="ghost" size="icon" onClick={() => onCancel(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold">Browser Notifications</p>
          <p>TechBuddy will trigger a browser notification when it's time to post. Make sure notifications are enabled!</p>
        </div>
      </div>
    </div>
  );
}
