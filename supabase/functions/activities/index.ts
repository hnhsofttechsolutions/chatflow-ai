import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MOCK_ACTIVITIES = [
  {
    type: "email",
    title: "Client Invoice Overdue",
    category: "Action Required",
    content: "Invoice #4821 from Acme Corp is 15 days overdue. AI recommends sending a follow-up reminder.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    type: "email",
    title: "Weekly Newsletter — TechCrunch",
    category: "FYI",
    content: "Weekly digest: 12 articles about AI startups, 3 funding rounds, 2 product launches.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    type: "email",
    title: "Suspicious Sender Detected",
    category: "Spam",
    content: "Email from unknown sender claiming prize winnings. Marked as spam and archived.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    type: "email",
    title: "Board Meeting Reschedule Request",
    category: "Action Required",
    content: "CFO requested moving Thursday's board meeting to Friday 3pm. Awaiting your confirmation.",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    type: "email",
    title: "Shipping Confirmation — Amazon",
    category: "FYI",
    content: "Your order #A-9182 has shipped. Expected delivery: March 21.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    type: "email",
    title: "Phishing Attempt Blocked",
    category: "Spam",
    content: "Blocked email impersonating IT department requesting password reset. Source: unknown domain.",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    type: "email",
    title: "Daily Email Digest",
    category: "FYI",
    content: "12 emails processed. 3 flagged urgent. 5 auto-archived. 4 require manual review.",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    type: "email",
    title: "Contract Review Needed",
    category: "Action Required",
    content: "Legal team sent updated NDA for Project Phoenix. Needs your signature by EOD Friday.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    type: "email",
    title: "Lottery Winner Notification",
    category: "Spam",
    content: "You've been selected as a winner of $5M. Flagged and blocked by AI spam filter.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    type: "twitter",
    title: "Market Summary — March 19",
    category: "Intel",
    content: "Markets showing bearish sentiment due to Fed signals. Tech sector down 2.3%. Crypto stable. AI recommends holding current positions. Key movers: NVDA -3.1%, AAPL +0.8%, TSLA -2.7%.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    type: "twitter",
    title: "Market Summary — March 18",
    category: "Intel",
    content: "S&P 500 gained 1.2% on strong earnings. Tech rally led by semiconductors. Oil prices stable at $78/barrel. Bond yields slightly up.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    type: "twitter",
    title: "Competitor Alert — March 18",
    category: "Intel",
    content: "Competitor launched new pricing tier. 47 mentions detected on Twitter. Sentiment: mostly positive. Recommendation: review pricing strategy.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    type: "twitter",
    title: "Market Summary — March 17",
    category: "Intel",
    content: "Mixed signals in global markets. European indices up 0.5%, Asian markets flat. Crypto saw 4% rally led by ETH. AI sentiment: cautiously optimistic.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    type: "task",
    title: "Task Suggestion Created",
    category: "Productivity",
    content: "Based on your calendar gaps, AI suggests scheduling the board deck review for Thursday 2–4pm.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    type: "alert",
    title: "Anomaly Detected",
    category: "Alert",
    content: "Unusual login attempt detected from new IP. MFA challenge was triggered and passed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    type: "task",
    title: "Weekly Report Compiled",
    category: "Reports",
    content: "AI compiled weekly KPI report: Revenue up 8%, customer churn down 1.2%, 14 support tickets resolved.",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const MONGODB_URI = Deno.env.get('MONGODB_URI');
    let activities: unknown[];

    if (MONGODB_URI) {
      try {
        const { MongoClient } = await import("npm:mongodb@6.12.0");
        const client = new MongoClient(MONGODB_URI, {
          serverSelectionTimeoutMS: 8000,
          connectTimeoutMS: 8000,
        });
        await client.connect();

        const admin = client.db().admin();
        const dbs = await admin.listDatabases();
        let found = false;

        for (const dbInfo of dbs.databases) {
          if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
          const db = client.db(dbInfo.name);
          const collections = await db.listCollections().toArray();
          const activityColl = collections.find(
            (c: { name: string }) => c.name === 'activities' || c.name === 'activity_log' || c.name === 'ai_activities'
          );
          if (activityColl) {
            const coll = db.collection(activityColl.name);
            activities = await coll.find({}).sort({ timestamp: -1 }).limit(50).toArray();
            found = true;
            break;
          }
        }

        await client.close();

        if (!found) {
          activities = MOCK_ACTIVITIES;
        }
      } catch (e) {
        console.error('MongoDB fetch failed, using mock data:', e);
        activities = MOCK_ACTIVITIES;
      }
    } else {
      activities = MOCK_ACTIVITIES;
    }

    return new Response(
      JSON.stringify({ data: activities }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Activities error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
