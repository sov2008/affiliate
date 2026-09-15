#!/usr/bin/env node
/**
 * Antigravity Production SSH & PM2 Auditing MCP Server
 * 
 * Compliant with Model Context Protocol (2024-11-05).
 * Built with native Node.js and ssh2 library.
 * Connects directly to production node (178.128.199.28) using SSH private key.
 * Provides tools for PM2 auditing, Nginx log inspection, TDS redirect verification,
 * and remote diagnostics.
 * Enforces AGENTS.md STRICT ZERO DEMO DATA RULE (100% real live server data).
 */

const ssh2 = require('ssh2');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse configuration from CLI arguments or environment variables
function parseConfig() {
  const args = process.argv.slice(2);
  const config = {
    host: process.env.SSH_HOST || '178.128.199.28',
    port: parseInt(process.env.SSH_PORT || '22', 10),
    username: process.env.SSH_USER || 'root',
    privateKeyPath: process.env.SSH_KEY_PATH || 'D:/keys/antigravity_digitalocean_ubuntu',
    connectTimeout: 10000
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host' && args[i + 1]) config.host = args[++i];
    else if (args[i] === '--port' && args[i + 1]) config.port = parseInt(args[++i], 10);
    else if (args[i] === '--user' && args[i + 1]) config.username = args[++i];
    else if (args[i] === '--key-path' && args[i + 1]) config.privateKeyPath = args[++i];
  }

  // Normalize windows paths if necessary
  config.privateKeyPath = path.resolve(config.privateKeyPath.replace(/\\/g, '/'));
  return config;
}

const CONFIG = parseConfig();

// Validate private key exists
if (!fs.existsSync(CONFIG.privateKeyPath)) {
  process.stderr.write(`[MCP-SSH] WARNING: Private key file not found at ${CONFIG.privateKeyPath}\n`);
}

let activeClient = null;
let connectionPromise = null;

function getSSHConnection() {
  if (activeClient) {
    return Promise.resolve(activeClient);
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(CONFIG.privateKeyPath)) {
        throw new Error(`Private key not found at ${CONFIG.privateKeyPath}`);
      }

      const privateKey = fs.readFileSync(CONFIG.privateKeyPath);
      const conn = new ssh2.Client();

      conn.on('ready', () => {
        process.stderr.write(`[MCP-SSH] ✅ Connected to ${CONFIG.username}@${CONFIG.host}:${CONFIG.port}\n`);
        activeClient = conn;
        connectionPromise = null;
        resolve(conn);
      });

      conn.on('error', (err) => {
        process.stderr.write(`[MCP-SSH] ❌ Connection error: ${err.message}\n`);
        activeClient = null;
        connectionPromise = null;
        reject(err);
      });

      conn.on('end', () => {
        process.stderr.write(`[MCP-SSH] ℹ️ Connection ended\n`);
        activeClient = null;
        connectionPromise = null;
      });

      conn.on('close', () => {
        activeClient = null;
        connectionPromise = null;
      });

      conn.connect({
        host: CONFIG.host,
        port: CONFIG.port,
        username: CONFIG.username,
        privateKey,
        readyTimeout: CONFIG.connectTimeout,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3
      });
    } catch (err) {
      connectionPromise = null;
      reject(err);
    }
  });

  return connectionPromise;
}

// Execute remote command with timeout
function executeRemoteCommand(command, timeoutMs = 30000) {
  return getSSHConnection().then((conn) => {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      let killed = false;

      const timer = setTimeout(() => {
        killed = true;
        reject(new Error(`Command timed out after ${timeoutMs}ms: ${command}`));
      }, timeoutMs);

      conn.exec(command, (err, stream) => {
        if (err) {
          clearTimeout(timer);
          return reject(err);
        }

        stream.on('data', (data) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        stream.on('close', (code, signal) => {
          clearTimeout(timer);
          if (killed) return;
          resolve({
            code: code !== undefined ? code : 0,
            signal: signal || null,
            stdout: stdout.trim(),
            stderr: stderr.trim()
          });
        });
      });
    });
  });
}

// Tool definitions according to MCP specification
const TOOLS = [
  {
    name: 'ssh_exec',
    description: 'Execute a bash command on the remote production server (178.128.199.28) over SSH.',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The bash command to execute on the remote production node.'
        },
        timeout_seconds: {
          type: 'number',
          description: 'Optional execution timeout in seconds (default: 30).'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'pm2_status',
    description: 'Audit status of PM2 daemon processes (affiliate-dashboard, affiliate-scheduler, affiliate-health-monitor, affiliate-autopilot, telegram bot/userbot, etc.) on the production node.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['table', 'json'],
          description: 'Output format: "table" for formatted terminal table, "json" for structured PM2 jlist output.'
        }
      }
    }
  },
  {
    name: 'pm2_logs',
    description: 'Retrieve real-time output and error logs from PM2 processes on the production node.',
    inputSchema: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          description: 'Process name or ID (e.g. "affiliate-dashboard", "affiliate-scheduler", "affiliate-autopilot") or "all". Default: "all".'
        },
        lines: {
          type: 'number',
          description: 'Number of log lines to retrieve (default: 50, max: 200).'
        }
      }
    }
  },
  {
    name: 'nginx_status',
    description: 'Inspect Nginx web server operational status and test configuration syntax (systemctl status nginx && nginx -t).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'nginx_logs',
    description: 'Read the latest entries from Nginx access or error logs on the production server.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['access', 'error'],
          description: 'Log type: "access" (/var/log/nginx/access.log) or "error" (/var/log/nginx/error.log).'
        },
        lines: {
          type: 'number',
          description: 'Number of lines to read (default: 50, max: 200).'
        }
      }
    }
  },
  {
    name: 'check_redirects',
    description: 'Verify live HTTP traffic routing, TDS redirects (/go), click trackers (/click), and MAB algorithm API on the production node.',
    inputSchema: {
      type: 'object',
      properties: {
        cid: {
          type: 'string',
          description: 'Optional campaign identifier or click ID to test (default: "mab_verify").'
        },
        offer: {
          type: 'string',
          description: 'Optional offer identifier to test (default: "lospollos_dating").'
        }
      }
    }
  },
  {
    name: 'server_uptime',
    description: 'Retrieve live server metrics: uptime, system load average, memory utilization, and disk free space on root mount.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Tool call handler
async function handleToolCall(toolName, args) {
  switch (toolName) {
    case 'ssh_exec': {
      const command = args?.command;
      if (!command) {
        throw new Error('Missing required argument: command');
      }
      const timeoutMs = (args?.timeout_seconds || 30) * 1000;
      const res = await executeRemoteCommand(command, timeoutMs);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res, null, 2)
          }
        ]
      };
    }

    case 'pm2_status': {
      const format = args?.format || 'table';
      if (format === 'json') {
        const res = await executeRemoteCommand('pm2 jlist');
        return {
          content: [
            {
              type: 'text',
              text: res.stdout || '[]'
            }
          ]
        };
      } else {
        const res = await executeRemoteCommand('pm2 status');
        return {
          content: [
            {
              type: 'text',
              text: res.stdout || res.stderr
            }
          ]
        };
      }
    }

    case 'pm2_logs': {
      const service = args?.service || 'all';
      const lines = Math.min(Math.max(args?.lines || 50, 1), 200);
      const target = service === 'all' ? '' : service;
      const cmd = `pm2 logs ${target} --lines ${lines} --nostream`;
      const res = await executeRemoteCommand(cmd);
      return {
        content: [
          {
            type: 'text',
            text: res.stdout || res.stderr || 'No logs found.'
          }
        ]
      };
    }

    case 'nginx_status': {
      const cmd = `
        echo "=== NGINX SYSTEMD STATUS ==="
        systemctl status nginx --no-pager -n 5 || true
        echo ""
        echo "=== NGINX CONFIG TEST ==="
        nginx -t
      `;
      const res = await executeRemoteCommand(cmd);
      return {
        content: [
          {
            type: 'text',
            text: res.stdout + (res.stderr ? `\nSTDERR:\n${res.stderr}` : '')
          }
        ]
      };
    }

    case 'nginx_logs': {
      const type = args?.type || 'access';
      const lines = Math.min(Math.max(args?.lines || 50, 1), 200);
      const logPath = type === 'error' ? '/var/log/nginx/error.log' : '/var/log/nginx/access.log';
      const cmd = `tail -n ${lines} ${logPath}`;
      const res = await executeRemoteCommand(cmd);
      return {
        content: [
          {
            type: 'text',
            text: res.stdout || res.stderr || `No entries in ${logPath}`
          }
        ]
      };
    }

    case 'check_redirects': {
      const cid = args?.cid || 'mab_verify';
      const offer = args?.offer || 'lospollos_dating';
      const cmd = `
        echo "=== [1] TDS REDIRECT (PORT 5000 /go) ==="
        curl -i -s "http://127.0.0.1:5000/go?cid=${cid}&offer=${offer}" | head -n 14
        echo ""
        echo "=== [2] CLICK TRACKER (PORT 3000 /click) ==="
        curl -i -s "http://127.0.0.1:3000/click?campaign=cmp_${offer}&source=${cid}" | head -n 14 || true
        echo ""
        echo "=== [3] MAB STATUS API (PORT 5000 /api/mab/status) ==="
        curl -s -u admin:AffOps_Secure_k9P2w8Nx7Q4m "http://127.0.0.1:5000/api/mab/status"
        echo ""
      `;
      const res = await executeRemoteCommand(cmd);
      return {
        content: [
          {
            type: 'text',
            text: res.stdout + (res.stderr ? `\nSTDERR:\n${res.stderr}` : '')
          }
        ]
      };
    }

    case 'server_uptime': {
      const cmd = `
        echo "=== UPTIME & LOAD AVERAGE ==="
        uptime
        echo ""
        echo "=== MEMORY (RAM & SWAP) ==="
        free -h
        echo ""
        echo "=== DISK UTILIZATION (/) ==="
        df -h /
      `;
      const res = await executeRemoteCommand(cmd);
      return {
        content: [
          {
            type: 'text',
            text: res.stdout
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// JSON-RPC Message Processing
async function processMessage(msg) {
  if (!msg || typeof msg !== 'object') return;
  const { id, method, params } = msg;

  switch (method) {
    case 'initialize': {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: 'antigravity-ssh-production',
          version: '1.0.0'
        }
      });
      break;
    }

    case 'ping': {
      sendResponse(id, {});
      break;
    }

    case 'tools/list': {
      sendResponse(id, {
        tools: TOOLS
      });
      break;
    }

    case 'tools/call': {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      try {
        const result = await handleToolCall(toolName, toolArgs);
        sendResponse(id, result);
      } catch (err) {
        sendError(id, -32603, err.message);
      }
      break;
    }

    default: {
      sendError(id, -32601, `Method '${method}' not found`);
      break;
    }
  }
}

function sendResponse(id, result) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id,
    result
  });
  process.stdout.write(payload + '\n');
}

function sendError(id, code, message) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message
    }
  });
  process.stdout.write(payload + '\n');
}

// Setup Standard Input Processing
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  line = line.trim();
  if (!line) return;

  if (line.startsWith('Content-Length:')) {
    return;
  }

  try {
    const parsed = JSON.parse(line);
    await processMessage(parsed);
  } catch (err) {
    process.stderr.write(`[MCP-SSH] JSON Parse error: ${err.message} for line: ${line}\n`);
  }
});

function cleanup() {
  if (activeClient) {
    try { activeClient.end(); } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
