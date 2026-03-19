import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DB_NAME = 'firstautomationdatabase';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const MONGODB_URI = Deno.env.get('MONGODB_URI');

    if (!MONGODB_URI) {
      return new Response(
        JSON.stringify({ summaries: [], emails: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { MongoClient } = await import("npm:mongodb@6.12.0");
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    try {
      await client.connect();
      const db = client.db(DB_NAME);

      // Fetch news_summaries (for Twitter tab)
      const summaries = await db
        .collection('news_summaries')
        .find({})
        .sort({ date: -1 })
        .limit(50)
        .toArray();

      // Fetch spam_emails (for Email tab)
      const spamEmails = await db
        .collection('spam_emails')
        .find({})
        .sort({ processedAt: -1 })
        .limit(50)
        .toArray();

      await client.close();

      return new Response(
        JSON.stringify({ summaries, emails: spamEmails }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      console.error('MongoDB fetch failed:', e);
      await client.close().catch(() => {});
      return new Response(
        JSON.stringify({ summaries: [], emails: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    console.error('Activities error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
