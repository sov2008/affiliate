export interface Env {
  STATS_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (pathname === '/click') {
      const clickId = searchParams.get('click_id');
      const campaignId = searchParams.get('campaign_id');
      const variant = searchParams.get('variant') || 'v1';

      if (campaignId) {
        const key = `stats_${campaignId}_${variant}`;
        let data = await env.STATS_KV.get(key, 'json') as any;
        if (!data) data = { clicks: 0, leads: 0, sales: 0, revenue: 0 };
        
        data.clicks++;
        await env.STATS_KV.put(key, JSON.stringify(data));
      }

      return new Response(JSON.stringify({ status: 'clicked' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (pathname === '/postback') {
      const clickId = searchParams.get('click_id') || '';
      const campaignId = searchParams.get('campaign_id');
      const variant = searchParams.get('variant') || 'v1';
      const payout = parseFloat(searchParams.get('payout') || '0');
      const status = searchParams.get('status') || 'lead';

      if (campaignId) {
        const key = `stats_${campaignId}_${variant}`;
        let data = await env.STATS_KV.get(key, 'json') as any;
        if (!data) data = { clicks: 0, leads: 0, sales: 0, revenue: 0 };
        
        if (status === 'lead') data.leads++;
        if (status === 'sale') data.sales++;
        data.revenue += payout;
        
        await env.STATS_KV.put(key, JSON.stringify(data));
      }

      return new Response(JSON.stringify({ status: 'recorded' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (pathname === '/stats') {
      const campaignId = searchParams.get('campaign_id');
      if (!campaignId) return new Response('Missing campaign_id', { status: 400 });

      const v1Data = await env.STATS_KV.get(`stats_${campaignId}_v1`, 'json') as any || { clicks: 0, leads: 0, sales: 0, revenue: 0 };
      const v2Data = await env.STATS_KV.get(`stats_${campaignId}_v2`, 'json') as any || { clicks: 0, leads: 0, sales: 0, revenue: 0 };

      const calculateCR = (d: any) => d.clicks > 0 ? ((d.leads + d.sales) / d.clicks * 100).toFixed(2) : 0;

      const result = {
        campaignId,
        v1: { ...v1Data, cr: calculateCR(v1Data) + '%' },
        v2: { ...v2Data, cr: calculateCR(v2Data) + '%' },
      };

      return new Response(JSON.stringify(result, null, 2), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response('Not Found', { status: 404 });
  }
};
