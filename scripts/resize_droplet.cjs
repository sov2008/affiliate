const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const tokenMatch = env.match(/DO_PAT=["']?([^"'\r\n]+)/);
const token = tokenMatch ? tokenMatch[1] : null;

if (!token) {
  console.error('DO_PAT not found in .env');
  process.exit(1);
}

const DROPLET_ID = 596594907;
const TARGET_SIZE = process.env.TARGET_SIZE || 's-2vcpu-4gb'; // 2 vCPU, 4GB RAM ($24/mo)

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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getDroplet() {
  const res = await doRequest(`/droplets/${DROPLET_ID}`);
  return res.data ? res.data.droplet : null;
}

async function getAction(actionId) {
  const res = await doRequest(`/droplets/${DROPLET_ID}/actions/${actionId}`);
  return res.data ? res.data.action : null;
}

async function triggerAction(actionType, extra = {}) {
  const payload = { type: actionType, ...extra };
  const res = await doRequest(`/droplets/${DROPLET_ID}/actions`, 'POST', payload);
  if (!res.data || !res.data.action) {
    throw new Error(`Action ${actionType} failed: ${JSON.stringify(res.data || res.raw)}`);
  }
  return res.data.action;
}

async function waitForAction(actionId, description) {
  console.log(`[WAIT] Waiting for action '${description}' (ID: ${actionId}) to complete...`);
  const maxWait = 180000; // 3 min
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const act = await getAction(actionId);
    if (!act) {
      console.log('Action lookup failed, retrying in 3s...');
      await sleep(3000);
      continue;
    }
    if (act.status === 'completed') {
      console.log(`[OK] Action '${description}' completed successfully.`);
      return true;
    }
    if (act.status === 'errored') {
      throw new Error(`Action '${description}' ERRORED: ${JSON.stringify(act)}`);
    }
    process.stdout.write('.');
    await sleep(4000);
  }
  throw new Error(`Action '${description}' timed out after ${maxWait / 1000}s`);
}

async function waitForStatus(targetStatus, maxSec = 120) {
  console.log(`[WAIT] Waiting for droplet status to become '${targetStatus}'...`);
  const start = Date.now();
  while (Date.now() - start < maxSec * 1000) {
    const d = await getDroplet();
    if (d && d.status === targetStatus) {
      console.log(`[OK] Droplet reached status '${targetStatus}'.`);
      return d;
    }
    process.stdout.write('.');
    await sleep(3000);
  }
  throw new Error(`Droplet did not reach '${targetStatus}' within ${maxSec}s`);
}

async function main() {
  console.log(`=========================================`);
  console.log(`DigitalOcean Droplet Resize Automation`);
  console.log(`Droplet ID: ${DROPLET_ID}`);
  console.log(`Target Size: ${TARGET_SIZE}`);
  console.log(`=========================================`);

  const initial = await getDroplet();
  if (!initial) {
    console.error('Failed to get droplet status!');
    process.exit(1);
  }

  console.log(`Current State: ${initial.status} | Size: ${initial.size_slug} (${initial.vcpus} vCPU, ${initial.memory} MB RAM)`);

  if (initial.size_slug === TARGET_SIZE) {
    console.log(`Droplet is already at target size '${TARGET_SIZE}'. Nothing to do!`);
    return;
  }

  // Step 1: Power off if active
  if (initial.status === 'active') {
    console.log('\n[STEP 1] Shutting down droplet gracefully...');
    try {
      const shutdownAct = await triggerAction('shutdown');
      await waitForAction(shutdownAct.id, 'graceful_shutdown');
    } catch (e) {
      console.warn('Graceful shutdown warning:', e.message, '-> Trying power_off');
      const powerOffAct = await triggerAction('power_off');
      await waitForAction(powerOffAct.id, 'power_off');
    }
    await waitForStatus('off', 60);
  } else {
    console.log(`Droplet is already off (${initial.status}). Skipping shutdown.`);
  }

  // Step 2: Trigger Resize
  console.log(`\n[STEP 2] Resizing droplet to ${TARGET_SIZE} (disk: false for reversible scale)...`);
  const resizeAct = await triggerAction('resize', {
    size: TARGET_SIZE,
    disk: false
  });
  await waitForAction(resizeAct.id, `resize to ${TARGET_SIZE}`);

  // Step 3: Power On
  console.log('\n[STEP 3] Powering on droplet...');
  const powerOnAct = await triggerAction('power_on');
  await waitForAction(powerOnAct.id, 'power_on');
  const final = await waitForStatus('active', 60);

  console.log(`\n=========================================`);
  console.log(`SUCCESS! Droplet resized and running.`);
  console.log(`Name:        ${final.name}`);
  console.log(`New Size:    ${final.size_slug}`);
  console.log(`CPU / RAM:   ${final.vcpus} vCPU / ${final.memory} MB RAM`);
  console.log(`IP Address:  ${final.networks.v4.map(n => n.ip_address).join(', ')}`);
  console.log(`Status:      ${final.status}`);
  console.log(`=========================================`);
}

main().catch(err => {
  console.error('\n[FATAL ERROR during resize]:', err);
  process.exit(1);
});
