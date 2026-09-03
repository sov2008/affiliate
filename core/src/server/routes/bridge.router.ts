import { Router, Request, Response } from 'express';
import { TelegramLeadRepository } from '../../db/tg-leads.repository.js';

export const bridgeRouter = Router();

export interface BridgeLandingOptions {
  botUsername: string;
  source: string;
  subSource: string;
}

/**
 * Generates ultra-lightweight (<2KB) high-conversion micro-landing HTML
 * with automatic deep-link launch and web fallback. Zero external CDN dependencies.
 */
export function generateBridgeHtml(options: BridgeLandingOptions): string {
  const { botUsername, source, subSource } = options;
  const startParam = `${source}_${subSource}`.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 64);
  const tgScheme = `tg://resolve?domain=${botUsername}&start=${startParam}`;
  const webFallback = `https://t.me/${botUsername}?start=${startParam}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Secure Match Filter // Verified Active Pool</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0b0f19;color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px}
    .card{background:#111827;border:1px solid #1f2937;border-radius:16px;padding:32px 24px;max-width:380px;width:100%;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,0.6)}
    .badge{display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;background:rgba(16,185,129,0.15);color:#10b981;padding:4px 10px;border-radius:9999px;margin-bottom:18px;border:1px solid rgba(16,185,129,0.3)}
    .spin{width:26px;height:26px;border:3px solid rgba(255,255,255,0.1);border-top-color:#3b82f6;border-radius:50%;animation:s .7s linear infinite;margin:0 auto 18px}
    @keyframes s{to{transform:rotate(360deg)}}
    h1{font-size:20px;font-weight:700;margin-bottom:8px;color:#fff}
    p{font-size:14px;color:#9ca3af;margin-bottom:24px;line-height:1.45}
    .btn{display:block;width:100%;padding:14px;background:#2563eb;color:#fff;text-decoration:none;font-weight:600;font-size:15px;border-radius:10px;transition:background .2s}
    .btn:hover{background:#1d4ed8}
    .footer{font-size:12px;color:#4b5563;margin-top:16px}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🔒 Verified Routing</div>
    <div class="spin"></div>
    <h1>Secure Match Filter</h1>
    <p>Routing to active verified pool...</p>
    <a id="btn" class="btn" href="${tgScheme}">[ Open Telegram Client ]</a>
    <div class="footer">Redirecting automatically...</div>
  </div>
  <script>
    (function(){
      var tg="${tgScheme}";
      var web="${webFallback}";
      try{window.location.href=tg;}catch(e){}
      setTimeout(function(){window.location.href=web;},1500);
    })();
  </script>
</body>
</html>`;
}

/**
 * HTTP Handler for /join/:source and /join
 */
export function handleBridgeRequest(req: Request, res: Response): void {
  const source = (req.params.source || req.query.source || 'direct') as string;
  const subSource = (req.query.sub || req.query.sub_source || req.query.angle || 'direct') as string;

  const ip =
    (req.headers['x-forwarded-for'] as string) ||
    req.socket.remoteAddress ||
    '';
  const userAgent = req.headers['user-agent'] || '';
  const referer = (req.headers.referer || req.headers.referrer || '') as string;

  // 1. Log click in SQLite table bridge_clicks
  try {
    TelegramLeadRepository.getInstance().recordBridgeClick(
      source,
      subSource,
      ip.split(',')[0].trim(),
      userAgent,
      referer
    );
  } catch (err) {
    console.warn('[BridgeRouter] Failed to log bridge click:', err);
  }

  // 2. Resolve bot username from environment
  const botUsername =
    process.env.TELEGRAM_BOT_USERNAME ||
    process.env.BOT_USERNAME ||
    'AffiliateMatchBot';

  // 3. Render and return ultra-lightweight HTML (<2KB)
  const html = generateBridgeHtml({ botUsername, source, subSource });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.status(200).send(html);
}

// Register routes
bridgeRouter.get('/join/:source', handleBridgeRequest);
bridgeRouter.get('/join', handleBridgeRequest);
