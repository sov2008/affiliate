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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Helper to extract parameters from query or POST JSON body
    let bodyParams: Record<string, any> = {};
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          bodyParams = await request.json();
        } catch (e) {}
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        try {
          const form = await request.formData();
          for (const [k, v] of form.entries()) {
            bodyParams[k] = v.toString();
          }
        } catch (e) {}
      }
    }

    const getParam = (key: string, alias?: string): string => {
      return searchParams.get(key) || (alias ? searchParams.get(alias) : null) || bodyParams[key] || (alias ? bodyParams[alias] : null) || '';
    };

    // 1. Click Tracking Beacon Endpoint
    if (pathname === '/click') {
      const clickId = getParam('click_id', 'ml_sub1') || 'clk_' + Math.random().toString(36).substring(2, 9);
      const campaignId = getParam('campaign_id', 'ml_sub2');
      const variant = getParam('variant', 'ml_sub3') || 'v1';
      const wallet = getParam('wallet', 'wallet_address');

      if (campaignId) {
        const key = `stats_${campaignId}_${variant}`;
        let data = await env.STATS_KV.get(key, 'json') as any;
        if (!data) data = { clicks: 0, leads: 0, sales: 0, revenue: 0, lastClick: null, wallets: [] };
        
        data.clicks = (data.clicks || 0) + 1;
        data.lastClick = new Date().toISOString();
        if (wallet && (!data.wallets || !data.wallets.includes(wallet))) {
          data.wallets = [...(data.wallets || []), wallet];
        }
        
        await env.STATS_KV.put(key, JSON.stringify(data));
      }

      return new Response(JSON.stringify({ 
        status: 'clicked',
        click_id: clickId,
        campaign_id: campaignId,
        variant,
        timestamp: new Date().toISOString()
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2. Postback / Webhook Ingestion Endpoint (MyLead, Admitad, Custom)
    if (pathname === '/postback' || pathname === '/webhook/mylead') {
      const clickId = getParam('click_id', 'ml_sub1');
      const campaignId = getParam('campaign_id', 'ml_sub2');
      const variant = getParam('variant', 'ml_sub3') || 'v1';
      const leadId = getParam('lead_id', 'transaction_id') || clickId;
      const rawPayout = getParam('payout', 'commission') || '0';
      const payout = parseFloat(rawPayout) || 0;
      const rawStatus = (getParam('status') || 'lead').toLowerCase();
      const currency = getParam('currency') || 'USD';

      if (campaignId) {
        const key = `stats_${campaignId}_${variant}`;
        let data = await env.STATS_KV.get(key, 'json') as any;
        if (!data) data = { clicks: 0, leads: 0, sales: 0, revenue: 0, log: [] };
        
        // Status mapping (MyLead: approved -> sale, lead -> lead)
        if (rawStatus === 'sale' || rawStatus === 'approved') {
          data.sales = (data.sales || 0) + 1;
          data.revenue = (data.revenue || 0) + payout;
        } else if (rawStatus === 'lead' || rawStatus === 'pending') {
          data.leads = (data.leads || 0) + 1;
          data.revenue = (data.revenue || 0) + payout;
        }

        // Keep last 10 transaction records
        data.log = [
          { leadId, status: rawStatus, payout, currency, date: new Date().toISOString() },
          ...(data.log || []).slice(0, 9)
        ];
        
        await env.STATS_KV.put(key, JSON.stringify(data));
      }

      return new Response(JSON.stringify({ 
        status: 'recorded', 
        campaignId, 
        variant, 
        payout, 
        currency,
        recordedStatus: rawStatus,
        timestamp: new Date().toISOString() 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 3. Stats Query Endpoint
    if (pathname === '/stats') {
      const campaignId = searchParams.get('campaign_id');
      if (!campaignId) return new Response(JSON.stringify({ error: 'Missing campaign_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const v1Data = await env.STATS_KV.get(`stats_${campaignId}_v1`, 'json') as any || { clicks: 0, leads: 0, sales: 0, revenue: 0 };
      const v2Data = await env.STATS_KV.get(`stats_${campaignId}_v2`, 'json') as any || { clicks: 0, leads: 0, sales: 0, revenue: 0 };

      const calculateCR = (d: any) => d.clicks > 0 ? (((d.leads || 0) + (d.sales || 0)) / d.clicks * 100).toFixed(2) : '0';

      const result = {
        campaignId,
        v1: { ...v1Data, cr: calculateCR(v1Data) + '%' },
        v2: { ...v2Data, cr: calculateCR(v2Data) + '%' },
      };

      return new Response(JSON.stringify(result, null, 2), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. Global Stats Summary (All Campaigns)
    if (pathname === '/stats/all') {
      const list = await env.STATS_KV.list({ prefix: 'stats_' });
      const statsMap: Record<string, any> = {};
      
      for (const key of list.keys) {
        const val = await env.STATS_KV.get(key.name, 'json');
        statsMap[key.name] = val;
      }

      return new Response(JSON.stringify({ totalKeys: list.keys.length, stats: statsMap }, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint Not Found', available: ['/click', '/postback', '/webhook/mylead', '/stats', '/stats/all'] }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
};
