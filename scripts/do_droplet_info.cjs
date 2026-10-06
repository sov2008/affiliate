const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const tokenMatch = env.match(/DO_PAT=["']?([^"'\r\n]+)/);
const token = tokenMatch ? tokenMatch[1] : null;

if (!token) {
  console.error('DO_PAT not found');
  process.exit(1);
}

function doRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://api.digitalocean.com/v2${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('Querying Droplet 596594907 details...');
  const res = await doRequest('/droplets/596594907');
  if (res.data && res.data.droplet) {
    const d = res.data.droplet;
    console.log('Droplet Name:', d.name);
    console.log('Status:', d.status);
    console.log('Current Size:', d.size_slug, `(${d.vcpus} vCPU, ${d.memory} MB RAM, ${d.disk} GB Disk)`);
    console.log('Region:', d.region.slug, `(${d.region.name})`);
    
    // Fetch all sizes
    const sizesRes = await doRequest('/sizes?per_page=100');
    if (sizesRes.data && sizesRes.data.sizes) {
      const candidates = sizesRes.data.sizes
        .filter(s => s.available && s.regions.includes(d.region.slug))
        .map(s => ({
          slug: s.slug,
          memory: s.memory,
          vcpus: s.vcpus,
          disk: s.disk,
          price_monthly: s.price_monthly
        }))
        .filter(s => s.memory >= 1024 && s.memory <= 8192)
        .sort((a, b) => a.price_monthly - b.price_monthly);

      console.log('Available Upgrade Candidates in Region:');
      console.log(JSON.stringify(candidates, null, 2));
    }
  } else {
    console.log('Response:', res.data || res.raw);
  }
}

main().catch(console.error);
