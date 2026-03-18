import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');
    if (!N8N_WEBHOOK_URL) {
      throw new Error('N8N_WEBHOOK_URL is not configured');
    }

    const { approvalId, action, content, metadata } = await req.json();

    if (!approvalId || !action) {
      return new Response(
        JSON.stringify({ error: 'approvalId and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['approve', 'deny'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'action must be approve or deny' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Derive the approval webhook URL from the base webhook URL
    const baseUrl = N8N_WEBHOOK_URL.replace(/\/webhook\/[^/]+$/, '');
    const approveUrl = `${baseUrl}/webhook/approval-response`;

    const response = await fetch(approveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approvalId,
        action,
        content: content || '',
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Approval webhook failed [${response.status}]: ${await response.text()}`);
    }

    const data = await response.json();
    const output = data.output || data.response || data.message || `Action ${action}d successfully.`;

    return new Response(
      JSON.stringify({ output }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Approval proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
