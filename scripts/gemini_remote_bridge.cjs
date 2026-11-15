/**
 * scripts/gemini_remote_bridge.cjs
 * 
 * Autonomous 24/7 Remote Control Bridge:
 * Gemini (Google Drive `affiliate` folder) -> Antigravity Local Workspace -> DigitalOcean Server (178.128.199.28)
 * 
 * Flow:
 * 1. Polls Google Drive folder `affiliate` (1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_) every 20 seconds.
 * 2. Scans for files named `GEMINI_CMD_*.json` or `GEMINI_TASK.md` with `"status": "PENDING"`.
 * 3. Downloads to `.antigravity/incoming_task.json`.
 * 4. Executes requested commands/tasks:
 *    - type === "shell_or_patch": executes commands locally and/or over SSH on 178.128.199.28.
 *    - type === "ide_prompt": writes prompt to ACTIVE_GEMINI_PROMPT.md.
 * 5. Updates status to "EXECUTED" on Google Drive.
 * 6. Invokes `scripts/sync_ecosystem_state.cjs` to sync latest SERVER_LIVE_STATUS.md back to Google Drive.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const ROOT_FOLDER_ID = '1XFVlk8CUeiHCJZJsRAc0Shbw3z-fFw7_';
const TOKEN_PATH = 'C:/Users/user/.gemini/antigravity/plugin_data/gdrive/token.json';
const POLL_INTERVAL_MS = 20000;

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] [Gemini-Bridge] ${msg}`);
}

async function getDriveAccessToken() {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`Token file missing at ${TOKEN_PATH}`);
  }

  let tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  let accessToken = tokenData.token.access_token;
  let tokenExpiry = new Date(tokenData.token.expiry || Date.now() + 3600 * 1000).getTime();

  if (Date.now() < tokenExpiry - 120000) {
    return accessToken;
  }

  // Refresh OAuth token
  const postData = new URLSearchParams({
    client_id: tokenData.client_id,
    client_secret: tokenData.client_secret,
    refresh_token: tokenData.token.refresh_token,
    grant_type: 'refresh_token'
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const resp = JSON.parse(body);
          if (resp.access_token) {
            accessToken = resp.access_token;
            tokenExpiry = Date.now() + (resp.expires_in || 3600) * 1000;
            tokenData.token.access_token = accessToken;
            tokenData.token.expiry = new Date(tokenExpiry).toISOString();
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2), 'utf8');
            resolve(accessToken);
          } else {
            reject(new Error('Refresh failed: ' + body));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function gdriveRequest(pathUrl, method = 'GET', data = null, headers = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getDriveAccessToken();
      const req = https.request({
        hostname: 'www.googleapis.com',
        path: pathUrl,
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...headers
        }
      }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { resolve(body ? JSON.parse(body) : {}); }
            catch (e) { resolve(body); }
          } else {
            reject(new Error(`Drive API Error [${res.statusCode}]: ${body}`));
          }
        });
      });
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function findPendingCommandFiles() {
  const q = `'${ROOT_FOLDER_ID}' in parents and trashed = false and (name contains 'GEMINI_CMD_' or name = 'GEMINI_TASK.md')`;
  const url = `/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,modifiedTime)&pageSize=10`;
  const res = await gdriveRequest(url);
  return res.files || [];
}

async function downloadFileContent(fileId) {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getDriveAccessToken();
      https.get(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve(body));
      }).on('error', reject);
    } catch (e) { reject(e); }
  });
}

async function updateFileOnDrive(fileId, contentStr) {
  const token = await getDriveAccessToken();
  return new Promise((resolve, reject) => {
    const req = https.request(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(contentStr)
      }
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve(b));
    });
    req.on('error', reject);
    req.write(contentStr);
    req.end();
  });
}

async function executeTask(taskFile) {
  log(`⚡ Found task file: ${taskFile.name} (ID: ${taskFile.id})`);
  const rawContent = await downloadFileContent(taskFile.id);
  
  let task = null;
  let isJson = false;

  try {
    task = JSON.parse(rawContent);
    isJson = true;
  } catch (_) {
    // If Markdown file GEMINI_TASK.md
    task = {
      type: 'ide_prompt',
      status: 'PENDING',
      prompt: rawContent
    };
  }

  if (task.status && task.status !== 'PENDING') {
    return; // Already processed
  }

  log(`📥 Processing task: ${task.title || task.type || 'Command'}`);

  const targetAntigravityDir = path.resolve(__dirname, '../.antigravity');
  if (!fs.existsSync(targetAntigravityDir)) fs.mkdirSync(targetAntigravityDir, { recursive: true });
  fs.writeFileSync(path.join(targetAntigravityDir, 'incoming_task.json'), JSON.stringify(task, null, 2), 'utf8');

  let executionOutput = '';

  try {
    if (task.type === 'shell_or_patch' && Array.isArray(task.commands)) {
      log(`🔨 Executing ${task.commands.length} shell commands...`);
      for (const cmd of task.commands) {
        log(`> ${cmd}`);
        const out = execSync(cmd, { encoding: 'utf8', cwd: path.resolve(__dirname, '..') });
        executionOutput += `\n$ ${cmd}\n${out}`;
      }
    } else if (task.type === 'ide_prompt') {
      const promptFile = path.resolve(__dirname, '../ACTIVE_GEMINI_PROMPT.md');
      fs.writeFileSync(promptFile, task.prompt || rawContent, 'utf8');
      executionOutput = `Prompt written to ${promptFile}. Ready for IDE agent execution.`;
      log(`📝 ${executionOutput}`);
    } else {
      executionOutput = `Unknown task type: ${task.type}`;
    }

    // Mark task as EXECUTED
    if (isJson) {
      task.status = 'EXECUTED';
      task.executedAt = new Date().toISOString();
      task.output = executionOutput;
      await updateFileOnDrive(taskFile.id, JSON.stringify(task, null, 2));
    } else {
      const updatedMd = `<!-- EXECUTED at ${new Date().toISOString()} -->\n` + rawContent;
      await updateFileOnDrive(taskFile.id, updatedMd);
    }

    log(`✅ Task ${taskFile.name} completed successfully.`);

    // Trigger state sync back to Google Drive
    log(`📡 Triggering ecosystem state sync...`);
    const { syncEcosystem } = require('./sync_ecosystem_state.cjs');
    await syncEcosystem();

  } catch (err) {
    log(`❌ Error executing task ${taskFile.name}: ${err.message}`);
    if (isJson) {
      task.status = 'FAILED';
      task.error = err.message;
      await updateFileOnDrive(taskFile.id, JSON.stringify(task, null, 2));
    }
  }
}

async function bridgePollCycle() {
  try {
    const files = await findPendingCommandFiles();
    for (const f of files) {
      await executeTask(f);
    }
  } catch (err) {
    log(`Poll loop note: ${err.message}`);
  }
}

function startBridgeDaemon() {
  log(`🚀 Autonomous Gemini -> Google Drive -> Workspace Bridge started. Polling every ${POLL_INTERVAL_MS / 1000}s...`);
  bridgePollCycle();
  setInterval(bridgePollCycle, POLL_INTERVAL_MS);
}

if (require.main === module) {
  startBridgeDaemon();
}

module.exports = { startBridgeDaemon, bridgePollCycle };
