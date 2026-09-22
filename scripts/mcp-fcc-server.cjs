#!/usr/bin/env node
/**
 * MCP Server: Free Claude Code & NVIDIA NIM Integration for Antigravity IDE
 * 
 * Provides native tools to:
 * 1. Generate forensic 16:9 covers via NVIDIA NIM FLUX.1-dev.
 * 2. Query Free Claude Code / NVIDIA NIM directly from chat.
 * 3. Check status of FCC proxy and active models.
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
function loadEnvSilently(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Load environment variables silently
loadEnvSilently(path.resolve(__dirname, '../.env'));
loadEnvSilently(path.resolve(__dirname, '../core/.env'));

const NVIDIA_KEY = process.env.NVIDIA_FLUX_DEV_API_KEY || process.env.NVIDIA_API_KEY || '';
const FCC_PROXY_URL = process.env.FCC_PROXY_URL || 'http://127.0.0.1:8082';

const TOOLS = [
  {
    name: 'fcc_generate_cover',
    description: 'Generate an ultra-photorealistic editorial documentary cover (16:9) using NVIDIA NIM FLUX.1-dev strictly adhering to British Technical Journalism (Cheltenham Desk) forensic evidence standards.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Detailed forensic scene description (e.g. physical evidence, retro ThinkPad, blockchain receipts, warm desk lamp, oscilloscope, 35mm grain).'
        },
        output_filename: {
          type: 'string',
          description: 'Filename to save in blog/public/images/posts/ (e.g. "my-case-study.webp" or "evidence.jpg").'
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'fcc_query_model',
    description: 'Ask a question or generate longread text/code via Free Claude Code local proxy (NVIDIA NIM / DeepSeek / Llama 3.3).',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The query or prompt to send.'
        },
        system_instruction: {
          type: 'string',
          description: 'Optional system prompt / persona instruction.'
        },
        max_tokens: {
          type: 'number',
          description: 'Maximum response tokens (default: 1500).'
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'fcc_get_status',
    description: 'Check active model, proxy health and connection status of Free Claude Code local server.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollNvcfQueue(reqId, apiKey) {
  const pollUrl = `https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/${reqId}`;
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(2500);
    const pollRes = await axios.get(pollUrl, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      validateStatus: () => true
    });
    if (pollRes.status === 200) {
      return pollRes.data;
    }
    if (pollRes.status !== 202) {
      throw new Error(`NVCF queue error (HTTP ${pollRes.status}): ${JSON.stringify(pollRes.data)}`);
    }
  }
  throw new Error(`NVCF queue timeout (${reqId})`);
}

function extractBase64(data) {
  if (data?.artifacts?.[0]?.base64) return data.artifacts[0].base64;
  if (data?.images?.[0]?.b64_json) return data.images[0].b64_json;
  if (data?.data?.[0]?.b64_json) return data.data[0].b64_json;
  if (typeof data?.b64_json === 'string') return data.b64_json;
  return null;
}

async function handleToolCall(name, args) {
  switch (name) {
    case 'fcc_get_status': {
      try {
        const res = await axios.get(`${FCC_PROXY_URL}/admin/api/status`, { timeout: 3000 });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'online',
                url: FCC_PROXY_URL,
                active_model: res.data.model,
                active_provider: res.data.provider,
                fcc_version: '6.2.55'
              }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'offline',
                error: err.message,
                hint: 'Run fcc-server to start local gateway.'
              }, null, 2)
            }
          ]
        };
      }
    }

    case 'fcc_query_model': {
      const { prompt, system_instruction, max_tokens = 1500 } = args;
      const messages = [];
      if (system_instruction) {
        messages.push({ role: 'system', content: system_instruction });
      }
      messages.push({ role: 'user', content: prompt });

      const payload = {
        model: 'claude-3-5-sonnet',
        max_tokens,
        messages
      };

      const res = await axios.post(`${FCC_PROXY_URL}/v1/messages`, payload, {
        headers: {
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      const textBlock = res.data?.content?.find((c) => c.type === 'text');
      return {
        content: [
          {
            type: 'text',
            text: textBlock ? textBlock.text : JSON.stringify(res.data)
          }
        ]
      };
    }

    case 'fcc_generate_cover': {
      const { prompt, output_filename } = args;
      const MASTER_STYLE = 'Editorial documentary photograph, 35mm film grain, analog surveillance aesthetic, forensic evidence shot, desk of a cyber intelligence investigator in Cheltenham UK, natural moody lighting, shallow depth of field, tactile paper and hardware textures, desaturated color grade with cold shadows, no anime, no cartoons, no CGI rendering, photorealistic 8k, aspect ratio 16:9';
      const fullPrompt = `${MASTER_STYLE}. Scene: ${prompt}`;

      const fluxUrl = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev';
      const res = await axios.post(
        fluxUrl,
        { prompt: fullPrompt, mode: 'base' },
        {
          headers: {
            Authorization: `Bearer ${NVIDIA_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          timeout: 90000,
          validateStatus: () => true
        }
      );

      let responseData = null;
      if (res.status === 200) {
        responseData = res.data;
      } else if (res.status === 202) {
        const reqId = res.headers['nvcf-reqid'];
        responseData = await pollNvcfQueue(reqId, NVIDIA_KEY);
      } else {
        throw new Error(`NVIDIA FLUX HTTP ${res.status}: ${JSON.stringify(res.data)}`);
      }

      const b64 = extractBase64(responseData);
      if (!b64) throw new Error('Failed to extract base64 image data');

      const buffer = Buffer.from(b64, 'base64');
      const filename = output_filename || `cover-${Date.now()}.jpg`;
      const outDir = path.resolve(__dirname, '../blog/public/images/posts');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const targetPath = path.join(outDir, filename);

      fs.writeFileSync(targetPath, buffer);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              engine: 'NVIDIA NIM FLUX.1-dev',
              saved_path: targetPath,
              bytes: buffer.length
            }, null, 2)
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function processMessage(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    sendResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'fcc-nvidia-mcp', version: '1.0.0' }
    });
    return;
  }

  if (method === 'notifications/initialized') {
    return;
  }

  if (method === 'tools/list') {
    sendResponse(id, { tools: TOOLS });
    return;
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};
    handleToolCall(toolName, toolArgs)
      .then((res) => sendResponse(id, res))
      .catch((err) => sendError(id, -32603, err.message));
    return;
  }

  sendError(id, -32601, `Method '${method}' not found`);
}

function sendResponse(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function sendError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  line = line.trim();
  if (!line || line.startsWith('Content-Length:')) return;
  try {
    const parsed = JSON.parse(line);
    processMessage(parsed);
  } catch (err) {
    process.stderr.write(`[MCP-FCC] JSON Parse error: ${err.message}\n`);
  }
});
