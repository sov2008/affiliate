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
const HTML_PATH = path.resolve(__dirname, 'dashboard.html');

// API Routes
app.get('/', async (req, res) => {
  try {
    const html = await fs.readFile(HTML_PATH, 'utf8');
    res.send(html);
  } catch (err) {
    res.status(500).send('Dashboard UI not found');
  }
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

app.post('/api/scout-now', (req, res) => {
  exec(`npx tsx src/smart-offer-scout.ts`, { cwd: __dirname });
  res.send('Scout started');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});
