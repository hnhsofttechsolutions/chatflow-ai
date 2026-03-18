import { useState, useMemo } from 'react';
import { useActivities } from '@/hooks/use-activities';
import ActivityCard from '@/components/dashboard/ActivityCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Search, RefreshCw, Mail, Twitter, ListChecks, AlertTriangle, Layers } from 'lucide-react';
import { Activity } from '@/lib/activities-client';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All', icon: Layers },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'twitter', label: 'Market', icon: Twitter },
  { value: 'task', label: 'Tasks', icon: ListChecks },
  { value: 'alert', label: 'Alerts', icon: AlertTriangle },
] as const;

const Dashboard = () => {
  const { data: activities, isLoading, isRefetching, refetch } = useActivities(10000);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!activities) return [];
    let list = activities;
    if (filter !== 'all') {
      list = list.filter((a) => a.type === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [activities, filter, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground leading-tight">AI Activity Feed</h1>
              <p className="text-[11px] text-muted-foreground">
                Live system monitor
                {isRefetching && <span className="ml-1.5 text-primary">● syncing</span>}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_OPTIONS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                }`}
              >
                <f.icon className="w-3 h-3" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No activity yet</p>
            <p className="text-xs text-muted-foreground">AI workflows haven't produced any results yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((activity, i) => (
              <ActivityCard key={activity._id || `${activity.timestamp}-${i}`} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
