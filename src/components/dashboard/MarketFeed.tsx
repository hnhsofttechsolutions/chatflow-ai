import { useState, useMemo } from 'react';
import { Activity } from '@/lib/activities-client';
import { TrendingUp, CalendarDays, BarChart3 } from 'lucide-react';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function formatDate(ts: string) {
  const d = new Date(ts);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'EEEE, MMM d · h:mm a');
}

interface Props {
  activities: Activity[];
}

const MarketFeed = ({ activities }: Props) => {
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const summaries = useMemo(() => {
    let list = activities.filter((a) => a.type === 'twitter');
    if (dateFilter) {
      list = list.filter((a) => isSameDay(new Date(a.timestamp), dateFilter));
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, dateFilter]);

  return (
    <div className="space-y-4">
      {/* Date filter */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {summaries.length} {summaries.length === 1 ? 'summary' : 'summaries'}
        </p>
        <div className="flex items-center gap-2">
          {dateFilter && (
            <button
              onClick={() => setDateFilter(undefined)}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Clear date
            </button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn(
                'h-8 text-xs gap-1.5',
                dateFilter && 'border-primary text-primary'
              )}>
                <CalendarDays className="w-3.5 h-3.5" />
                {dateFilter ? format(dateFilter, 'MMM d') : 'Filter by date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Cards */}
      {summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <BarChart3 className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No summaries found</p>
          <p className="text-xs text-muted-foreground">
            {dateFilter ? 'No summaries for this date.' : 'Market summaries will appear here when generated.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {summaries.map((s, i) => (
            <div
              key={s._id || `${s.timestamp}-${i}`}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{s.title}</h3>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">{formatDate(s.timestamp)}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
              {s.category && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    {s.category}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketFeed;
