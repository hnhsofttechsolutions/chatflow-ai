import { useState, useMemo } from 'react';
import { Activity } from '@/lib/activities-client';
import { Mail, ShieldAlert, Info, AlertCircle, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EMAIL_CATEGORIES = [
  { value: 'all', label: 'All', icon: Mail },
  { value: 'Action Required', label: 'Action Required', icon: AlertCircle },
  { value: 'FYI', label: 'FYI', icon: Info },
  { value: 'Spam', label: 'Spam', icon: ShieldAlert },
] as const;

const categoryStyle: Record<string, { border: string; bg: string; text: string; icon: React.ElementType }> = {
  'Action Required': { border: 'border-orange-300', bg: 'bg-orange-50', text: 'text-orange-700', icon: AlertCircle },
  'FYI': { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', icon: Info },
  'Spam': { border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-700', icon: ShieldAlert },
};

function formatTime(ts: string) {
  const d = new Date(ts);
  if (isToday(d)) return `Today ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

interface Props {
  activities: Activity[];
}

const EmailFeed = ({ activities }: Props) => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const emails = useMemo(() => {
    let list = activities.filter((a) => a.type === 'email');
    if (categoryFilter !== 'all') {
      list = list.filter((a) => a.category === categoryFilter);
    }
    if (dateFilter) {
      list = list.filter((a) => isSameDay(new Date(a.timestamp), dateFilter));
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, categoryFilter, dateFilter]);

  const counts = useMemo(() => {
    const emailList = activities.filter((a) => a.type === 'email');
    return {
      all: emailList.length,
      'Action Required': emailList.filter((a) => a.category === 'Action Required').length,
      'FYI': emailList.filter((a) => a.category === 'FYI').length,
      'Spam': emailList.filter((a) => a.category === 'Spam').length,
    };
  }, [activities]);

  return (
    <div className="space-y-4">
      {/* Category filters + date */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {EMAIL_CATEGORIES.map((c) => {
            const active = categoryFilter === c.value;
            const count = counts[c.value as keyof typeof counts] || 0;
            return (
              <button
                key={c.value}
                onClick={() => setCategoryFilter(c.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border',
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                )}
              >
                <c.icon className="w-3 h-3" />
                {c.label}
                <span className={cn(
                  'ml-0.5 text-[10px] rounded-full px-1.5 py-0.5 leading-none',
                  active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

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

      {/* Email list */}
      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <Mail className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No emails found</p>
          <p className="text-xs text-muted-foreground">
            {dateFilter ? 'No emails for this date.' : 'No emails match the current filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {emails.map((email, i) => {
            const style = categoryStyle[email.category || 'FYI'] || categoryStyle['FYI'];
            const CatIcon = style.icon;
            return (
              <div
                key={email._id || `${email.timestamp}-${i}`}
                className={cn(
                  'bg-card border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm transition-all hover:shadow-md',
                  style.border
                )}
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', style.bg)}>
                    <CatIcon className={cn('w-3.5 h-3.5', style.text)} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground flex-1">{email.title}</h3>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0 h-4 font-medium border', style.bg, style.text, style.border)}
                  >
                    {email.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-8">{email.content}</p>
                <span className="text-[11px] text-muted-foreground/60 mt-1.5 block pl-8">{formatTime(email.timestamp)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmailFeed;
