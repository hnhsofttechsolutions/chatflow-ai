import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// MongoDB Atlas Data API approach since native driver has issues in Deno edge runtime
// We'll use the REST Data API instead

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const MONGODB_URI = Deno.env.get('MONGODB_URI');
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    const { action, database, collection, filter, limit } = await req.json();

    // Parse cluster info from connection string
    const clusterMatch = MONGODB_URI.match(/@([^/]+)/);
    const clusterHost = clusterMatch ? clusterMatch[1] : '';
    
    // Extract credentials
    const credMatch = MONGODB_URI.match(/\/\/([^:]+):([^@]+)@/);
    const username = credMatch ? credMatch[1] : '';
    const password = credMatch ? decodeURIComponent(credMatch[2]) : '';

    // Extract appName
    const appNameMatch = MONGODB_URI.match(/appName=([^&]+)/);
    const dataSource = appNameMatch ? appNameMatch[1] : 'os-automation';

    // Use MongoDB Atlas Data API
    // The Data API endpoint format: https://data.mongodb-api.com/app/<app-id>/endpoint/data/v1
    // However, Data API requires setup in Atlas. Let's use a direct approach with the npm driver instead.

    // Import MongoDB driver for Deno
    const { MongoClient } = await import("npm:mongodb@6.12.0");

    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    await client.connect();

    let result: unknown;

    if (action === 'listDatabases') {
      const admin = client.db().admin();
      const dbs = await admin.listDatabases();
      result = dbs.databases.map((db: { name: string; sizeOnDisk?: number }) => ({
        name: db.name,
        sizeOnDisk: db.sizeOnDisk,
      }));
    } else if (action === 'listCollections') {
      if (!database) throw new Error('database is required');
      const db = client.db(database);
      const collections = await db.listCollections().toArray();
      result = collections.map((c: { name: string; type?: string }) => ({
        name: c.name,
        type: c.type,
      }));
    } else if (action === 'find') {
      if (!database || !collection) throw new Error('database and collection are required');
      const db = client.db(database);
      const coll = db.collection(collection);
      const docs = await coll.find(filter || {}).limit(limit || 20).toArray();
      result = docs;
    } else if (action === 'count') {
      if (!database || !collection) throw new Error('database and collection are required');
      const db = client.db(database);
      const coll = db.collection(collection);
      const count = await coll.countDocuments(filter || {});
      result = { count };
    } else if (action === 'overview') {
      // Get all databases, their collections, and sample docs
      const admin = client.db().admin();
      const dbs = await admin.listDatabases();
      const overview: Array<{ database: string; collections: Array<{ name: string; count: number; sample: unknown[] }> }> = [];

      for (const dbInfo of dbs.databases) {
        if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
        const db = client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();
        const collData: Array<{ name: string; count: number; sample: unknown[] }> = [];

        for (const coll of collections) {
          const collection = db.collection(coll.name);
          const count = await collection.countDocuments();
          const sample = await collection.find().limit(3).toArray();
          collData.push({ name: coll.name, count, sample });
        }

        overview.push({ database: dbInfo.name, collections: collData });
      }
      result = overview;
    } else {
      throw new Error(`Unknown action: ${action}. Supported: listDatabases, listCollections, find, count, overview`);
    }

    await client.close();

    return new Response(
      JSON.stringify({ data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('MongoDB error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
