import { Activity } from '@/lib/activities-client';
import { Mail, Twitter, ListChecks, AlertTriangle, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; badge: string }> = {
  email:   { icon: Mail,          color: 'text-blue-600',   bg: 'bg-blue-100',   badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  twitter: { icon: Twitter,       color: 'text-purple-600', bg: 'bg-purple-100', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  task:    { icon: ListChecks,    color: 'text-emerald-600', bg: 'bg-emerald-100', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  alert:   { icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-100',    badge: 'bg-red-100 text-red-700 border-red-200' },
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface Props {
  activity: Activity;
}

const ActivityCard = ({ activity }: Props) => {
  const config = typeConfig[activity.type] || typeConfig.task;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 animate-slide-up">
      <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground">{activity.title}</h3>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 font-medium border ${config.badge}`}>
            {activity.type}
          </Badge>
          {activity.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
              {activity.category}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{activity.content}</p>
        <span className="text-[11px] text-muted-foreground/70 mt-1.5 block">{timeAgo(activity.timestamp)}</span>
      </div>
    </div>
  );
};

export default ActivityCard;
