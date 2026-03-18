import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Mock data for when MongoDB is not available or has no activities collection
const MOCK_ACTIVITIES = [
  {
    type: "email",
    title: "Email Categorized",
    category: "Action Required",
    content: "Client asked for update on Q1 deliverables — flagged as urgent by AI triage system.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    type: "twitter",
    title: "Market Summary Generated",
    category: "Intel",
    content: "Markets showing bearish sentiment due to Fed signals. Tech sector down 2.3%. Crypto stable. AI recommends holding current positions.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
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
    type: "email",
    title: "Daily Email Digest",
    category: "Summary",
    content: "12 emails processed. 3 flagged urgent. 5 auto-archived. 4 require manual review.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    type: "task",
    title: "Weekly Report Compiled",
    category: "Reports",
    content: "AI compiled weekly KPI report: Revenue up 8%, customer churn down 1.2%, 14 support tickets resolved.",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    type: "twitter",
    title: "Competitor Mention Tracked",
    category: "Intel",
    content: "Competitor launched new pricing tier. 47 mentions detected on Twitter. Sentiment: mostly positive.",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
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

        // Try to find an activities collection across databases
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
