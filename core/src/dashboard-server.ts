import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

const MEMORY_PATH = path.resolve(__dirname, '../../.antigravity/memory.json');
const LOG_PATH = path.resolve(__dirname, '../../.antigravity/daemon.log');

// HTML UI
const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executive Dashboard | Affiliate Engine</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; }
    .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
    .log-container { font-family: 'Fira Code', monospace; height: 300px; overflow-y: auto; }
  </style>
</head>
<body class="p-8">
  <div class="max-w-7xl mx-auto space-y-8">
    <header class="flex justify-between items-center">
      <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
        Executive Dashboard
      </h1>
      <div class="text-sm text-slate-400">Autonomous Optimization Engine Active</div>
    </header>

    <!-- Top Cards -->
    <div class="grid grid-cols-4 gap-6" id="statsCards">
      <div class="glass rounded-xl p-6">
        <h3 class="text-slate-400 text-sm font-medium">Total Revenue</h3>
        <p class="text-3xl font-bold text-emerald-400 mt-2" id="totalRev">$0</p>
      </div>
      <div class="glass rounded-xl p-6">
        <h3 class="text-slate-400 text-sm font-medium">Total Clicks</h3>
        <p class="text-3xl font-bold text-blue-400 mt-2" id="totalClicks">0</p>
      </div>
      <div class="glass rounded-xl p-6">
        <h3 class="text-slate-400 text-sm font-medium">Active Campaigns</h3>
        <p class="text-3xl font-bold text-indigo-400 mt-2" id="totalCamps">0</p>
      </div>
      <div class="glass rounded-xl p-6">
        <h3 class="text-slate-400 text-sm font-medium">Global CR</h3>
        <p class="text-3xl font-bold text-purple-400 mt-2" id="globalCR">0%</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-3 gap-8">
      
      <!-- Campaigns Table -->
      <div class="col-span-2 glass rounded-xl p-6">
        <h2 class="text-xl font-semibold mb-4">Active Campaigns</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="text-slate-400 border-b border-slate-700">
              <tr>
                <th class="pb-3">Campaign ID</th>
                <th class="pb-3">Variant</th>
                <th class="pb-3">Clicks</th>
                <th class="pb-3">Revenue</th>
                <th class="pb-3">CR</th>
              </tr>
            </thead>
            <tbody id="campaignTable" class="divide-y divide-slate-800/50">
              <!-- JS injected -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Launch & Logs -->
      <div class="space-y-8">
        <div class="glass rounded-xl p-6">
          <h2 class="text-xl font-semibold mb-4">Quick Launch</h2>
          <form id="launchForm" class="space-y-4">
            <div>
              <label class="block text-xs text-slate-400 mb-1">Offer Name</label>
              <input type="text" id="offerName" class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="e.g. Smart Watch">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Target GEOs (comma sep)</label>
              <input type="text" id="offerGeo" class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" value="US,DE">
            </div>
            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded transition">
              Deploy Campaign
            </button>
          </form>
        </div>

        <div class="glass rounded-xl p-6">
          <h2 class="text-xl font-semibold mb-4 text-emerald-400 flex items-center">
            <span class="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            Daemon Log
          </h2>
          <div id="logFeed" class="log-container bg-slate-950 rounded p-4 text-xs text-emerald-500 overflow-x-hidden whitespace-pre-wrap"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function loadStats() {
      const res = await fetch('/api/stats');
      const data = await res.json();
      
      let rev = 0, clicks = 0, leads = 0;
      let tbody = '';
      
      for (const [cid, cData] of Object.entries(data)) {
        if (!cData.performance) continue;
        for (const [v, p] of Object.entries(cData.performance)) {
           if (v === 'lastSynced') continue;
           rev += p.revenue || 0;
           clicks += p.clicks || 0;
           leads += p.leads || 0;
           leads += p.sales || 0;
           
           tbody += `
             <tr>
               <td class="py-3 text-slate-300">${cid}</td>
               <td class="py-3"><span class="bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded text-xs">${v}</span></td>
               <td class="py-3">${p.clicks || 0}</td>
               <td class="py-3 text-emerald-400">$${p.revenue || 0}</td>
               <td class="py-3">${p.cr || '0%'}</td>
             </tr>
           `;
        }
      }
      
      document.getElementById('totalRev').innerText = '$' + rev.toFixed(2);
      document.getElementById('totalClicks').innerText = clicks;
      document.getElementById('totalCamps').innerText = Object.keys(data).length;
      document.getElementById('globalCR').innerText = clicks > 0 ? ((leads / clicks) * 100).toFixed(2) + '%' : '0%';
      document.getElementById('campaignTable').innerHTML = tbody;
    }

    async function loadLogs() {
      const res = await fetch('/api/logs');
      const text = await res.text();
      const div = document.getElementById('logFeed');
      div.innerText = text;
      div.scrollTop = div.scrollHeight;
    }

    document.getElementById('launchForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('offerName').value;
      const geo = document.getElementById('offerGeo').value;
      alert('Launch command sent to core engine!');
      await fetch('/api/launch', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, geo })
      });
    });

    setInterval(loadStats, 2000);
    setInterval(loadLogs, 1000);
    loadStats();
    loadLogs();
  </script>
</body>
</html>
`;

// API Routes
app.get('/', (req, res) => {
  res.send(HTML_CONTENT);
});

app.get('/api/stats', async (req, res) => {
  try {
    const memory = await fs.readFile(MEMORY_PATH, 'utf8');
    const data = JSON.parse(memory);
    res.json(data.deployed_campaigns || {});
  } catch (err) {
    res.json({});
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await fs.readFile(LOG_PATH, 'utf8');
    // Return last 30 lines
    const lines = logs.split('\n').filter(Boolean);
    res.send(lines.slice(-30).join('\n'));
  } catch (err) {
    res.send('No logs yet...');
  }
});

app.post('/api/launch', (req, res) => {
  const { name, geo } = req.body;
  if (!name || !geo) return res.status(400).send('Missing name or geo');
  
  // Fire and forget background process
  exec(`npx tsx src/cli.ts launch --name="${name}" --geo="${geo}"`, { cwd: __dirname });
  res.send('Launched');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(\`Dashboard running at http://localhost:\${PORT}\`);
});
