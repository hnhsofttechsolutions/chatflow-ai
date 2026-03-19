import { useState, useMemo } from 'react';
import { NewsSummary } from '@/lib/activities-client';
import { TrendingUp, CalendarDays, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

function formatDate(ts: string) {
  const d = new Date(ts);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'EEEE, MMM d · h:mm a');
}

interface Props {
  summaries: NewsSummary[];
}

const MarketFeed = ({ summaries: rawSummaries }: Props) => {
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const summaries = useMemo(() => {
    let list = [...rawSummaries];
    if (dateFilter) {
      list = list.filter((s) => isSameDay(new Date(s.date), dateFilter));
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [rawSummaries, dateFilter]);

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
        <div className="space-y-4">
          {summaries.map((s) => {
            const isExpanded = expandedId === s._id;
            // Extract first section as preview (up to first ---)
            const previewEnd = s.summary.indexOf('---', 10);
            const preview = previewEnd > 0 ? s.summary.slice(0, previewEnd) : s.summary.slice(0, 500);

            return (
              <div
                key={s._id}
                className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground/70">{formatDate(s.date)}</p>
                      <p className="text-[11px] text-muted-foreground/50">{s.source_count} sources analyzed</p>
                    </div>
                  </div>

                  {/* Summary content */}
                  <div className={cn(
                    'prose prose-sm max-w-none text-foreground',
                    'prose-headings:text-foreground prose-headings:font-semibold',
                    'prose-h1:text-base prose-h2:text-sm prose-h3:text-xs',
                    'prose-p:text-sm prose-p:text-muted-foreground prose-p:leading-relaxed',
                    'prose-strong:text-foreground',
                    'prose-li:text-sm prose-li:text-muted-foreground',
                    'prose-table:text-xs',
                    'prose-th:text-foreground prose-td:text-muted-foreground',
                    !isExpanded && 'max-h-48 overflow-hidden relative'
                  )}>
                    <ReactMarkdown>{isExpanded ? s.summary : preview}</ReactMarkdown>
                    {!isExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
                    )}
                  </div>
                </div>

                {/* Expand/Collapse */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : s._id)}
                  className="w-full px-5 py-2.5 border-t border-border flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Read full summary
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketFeed;
