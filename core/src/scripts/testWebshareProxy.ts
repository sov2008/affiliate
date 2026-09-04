import path from 'path';
import dotenv from 'dotenv';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

async function runDiagnostics() {
  const proxyEnabled = (process.env.REDDIT_PROXY_ENABLED || '').toLowerCase() === 'true';
  const proxyUrl = process.env.REDDIT_PROXY_URL || '';
  const sessionCookie = process.env.REDDIT_SESSION_COOKIE || '';
  const expectedUser = process.env.REDDIT_USERNAME || 'sov2008';

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🌐 Webshare Proxy Diagnostic & Verification Suite');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Config: REDDIT_PROXY_ENABLED = ${proxyEnabled}`);
  console.log(`Config: REDDIT_PROXY_URL     = ${proxyUrl.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`Config: REDDIT_USERNAME      = ${expectedUser}`);
  console.log(`Config: Session Cookie len   = ${sessionCookie ? sessionCookie.length : 0}`);
  console.log('───────────────────────────────────────────────────────────────');

  if (!proxyUrl) {
    console.error('❌ REDDIT_PROXY_URL is not defined in environment!');
    process.exit(1);
  }

  const dispatcher = new ProxyAgent(proxyUrl);
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Webshare Diagnostic/1.0)';

  // 1. IP Check via ipify
  console.log('\n[1/3] Testing outgoing IP via https://api.ipify.org?format=json ...');
  try {
    const ipRes = await undiciFetch('https://api.ipify.org?format=json', {
      headers: { 'User-Agent': userAgent },
      dispatcher,
    });

    if (!ipRes.ok) {
      console.error(`❌ ipify returned HTTP ${ipRes.status}: ${ipRes.statusText}`);
    } else {
      const ipData = (await ipRes.json()) as { ip: string };
      console.log(`   ✓ Outgoing IP through proxy: ${ipData.ip}`);
      if (ipData.ip === '198.23.243.226') {
        console.log('   ✅ Match confirmed! Outgoing IP matches Webshare US proxy (198.23.243.226)');
      } else {
        console.warn(`   ⚠️ Warning: IP is ${ipData.ip}, expected 198.23.243.226`);
      }
    }
  } catch (err: any) {
    console.error(`❌ ipify connection failed: ${err.message || err}`);
  }

  // 2. Public Reddit endpoint reachability
  console.log('\n[2/3] Testing Reddit endpoint: https://www.reddit.com/r/AskReddit/new.json ...');
  try {
    const t0 = Date.now();
    const headers: Record<string, string> = {
      'User-Agent': userAgent,
      Accept: 'application/json',
    };
    if (sessionCookie) {
      headers['Cookie'] = `reddit_session=${sessionCookie}`;
    }

    const redditRes = await undiciFetch('https://www.reddit.com/r/AskReddit/new.json?limit=5', {
      headers,
      dispatcher,
    });
    const latency = Date.now() - t0;

    console.log(`   HTTP Status: ${redditRes.status} ${redditRes.statusText} (${latency}ms)`);
    if (redditRes.ok) {
      const data: any = await redditRes.json();
      const count = data?.data?.children?.length || 0;
      console.log(`   ✅ Reddit API reachable through proxy! Retrieved ${count} posts.`);
    } else {
      const text = await redditRes.text();
      console.error(`   ❌ Reddit returned HTTP ${redditRes.status}: ${text.slice(0, 200)}`);
    }
  } catch (err: any) {
    console.error(`❌ Reddit request failed: ${err.message || err}`);
  }

  // 3. Authenticated endpoint verification (/api/me.json)
  console.log('\n[3/3] Testing authenticated Reddit endpoint: https://www.reddit.com/api/me.json ...');
  if (!sessionCookie) {
    console.warn('   ⚠️ REDDIT_SESSION_COOKIE is empty, skipping auth check.');
  } else {
    try {
      const authRes = await undiciFetch('https://www.reddit.com/api/me.json', {
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/json',
          Cookie: `reddit_session=${sessionCookie}`,
        },
        dispatcher,
      });

      console.log(`   HTTP Status: ${authRes.status} ${authRes.statusText}`);
      if (authRes.ok) {
        const authData: any = await authRes.json();
        const username = authData?.data?.name;
        const karma = authData?.data?.total_karma;
        const commentKarma = authData?.data?.comment_karma;
        const linkKarma = authData?.data?.link_karma;
        console.log(`   ✓ Authenticated Username : u/${username}`);
        console.log(`   ✓ Comment Karma          : ${commentKarma}`);
        console.log(`   ✓ Link Karma             : ${linkKarma}`);
        console.log(`   ✓ Total Karma            : ${karma}`);
        if (username?.toLowerCase() === expectedUser.toLowerCase()) {
          console.log(`   ✅ Session verified successfully for target user u/${expectedUser}!`);
        } else {
          console.warn(`   ⚠️ Warning: Logged in user u/${username} does not match expected u/${expectedUser}`);
        }
      } else {
        const text = await authRes.text();
        console.error(`   ❌ /api/me.json failed with HTTP ${authRes.status}: ${text.slice(0, 200)}`);
      }
    } catch (err: any) {
      console.error(`❌ /api/me.json request failed: ${err.message || err}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Diagnostic Run Complete');
  console.log('═══════════════════════════════════════════════════════════════');
}

runDiagnostics().catch((err) => {
  console.error('Fatal error during diagnostic:', err);
  process.exit(1);
});
