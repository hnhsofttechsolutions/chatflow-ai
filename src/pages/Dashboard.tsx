import { useActivities } from '@/hooks/use-activities';
import EmailFeed from '@/components/dashboard/EmailFeed';
import MarketFeed from '@/components/dashboard/MarketFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, RefreshCw, Mail, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { data, isLoading, isRefetching, refetch } = useActivities(10000);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground leading-tight">AI Activity Dashboard</h1>
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

      <div className="max-w-4xl mx-auto px-4 py-5">
        {isLoading ? (
          <div className="space-y-4 pt-4">
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
        ) : (
          <Tabs defaultValue="emails" className="w-full">
            <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1 mb-5">
              <TabsTrigger value="emails" className="gap-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Mail className="w-3.5 h-3.5" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="twitter" className="gap-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                Twitter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="emails">
              <EmailFeed emails={data?.emails || []} />
            </TabsContent>

            <TabsContent value="twitter">
              <MarketFeed summaries={data?.summaries || []} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
