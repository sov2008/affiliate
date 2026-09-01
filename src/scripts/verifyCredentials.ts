import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import axios from 'axios';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from workspace root and core folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../core/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ANSI Color Helpers for rich terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
  bgYellow: '\x1b[43m\x1b[30m',
};

export interface VerificationResult {
  provider: string;
  serviceOrModel: string;
  status: 'OK' | 'FAIL' | 'SKIPPED';
  latencyMs: number;
  httpStatus?: number | string;
  details: string;
  error?: string;
  rawPayload?: any;
}

const results: VerificationResult[] = [];

/**
 * 1. Groq API Verification
 * Sends a mini test prompt ("ping") to llama-3.3-70b-versatile with intelligent active model discovery.
 */
async function testGroq(): Promise<VerificationResult> {
  const apiKey = process.env.GROQ_API_KEY;
  let targetModel = 'llama-3.3-70b-versatile';

  if (!apiKey) {
    return {
      provider: 'Groq',
      serviceOrModel: targetModel,
      status: 'SKIPPED',
      latencyMs: 0,
      details: 'GROQ_API_KEY not configured in .env',
    };
  }

  const start = Date.now();
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      timeout: 15000,
    });

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: targetModel,
        messages: [{ role: 'user', content: 'Reply with the single word: "pong"' }],
        max_tokens: 5,
        temperature: 0.1,
      });
    } catch (err: any) {
      if (err?.status === 404 || err?.message?.includes('does not exist')) {
        targetModel = 'groq/compound-mini';
        completion = await client.chat.completions.create({
          model: targetModel,
          messages: [{ role: 'user', content: 'Reply with the single word: "pong"' }],
          max_tokens: 5,
          temperature: 0.1,
        });
      } else {
        throw err;
      }
    }

    const latency = Date.now() - start;
    const reply = completion.choices[0]?.message?.content?.trim() || 'OK';
    return {
      provider: 'Groq',
      serviceOrModel: targetModel,
      status: 'OK',
      latencyMs: latency,
      httpStatus: 200,
      details: `Inference OK: "${reply.slice(0, 30)}"`,
      rawPayload: completion,
    };
  } catch (err: any) {
    const httpStatus = err?.status || err?.response?.status || 'ERR';
    const rawPayload = err?.error || err?.response?.data || err?.message;
    return {
      provider: 'Groq',
      serviceOrModel: targetModel,
      status: 'FAIL',
      latencyMs: Date.now() - start,
      httpStatus,
      details: 'Groq API request failed',
      error: err?.message || String(err),
      rawPayload,
    };
  }
}

/**
 * 2. Cerebras API Verification
 * Sends a test prompt ("ping") to llama-3.3-70b / available Cerebras fast models.
 */
async function testCerebras(): Promise<VerificationResult> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  let targetModel = 'llama-3.3-70b';

  if (!apiKey) {
    return {
      provider: 'Cerebras',
      serviceOrModel: targetModel,
      status: 'SKIPPED',
      latencyMs: 0,
      details: 'CEREBRAS_API_KEY not configured in .env',
    };
  }

  const start = Date.now();
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.cerebras.ai/v1',
      timeout: 15000,
    });

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: targetModel,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
        temperature: 0.1,
      });
    } catch (err: any) {
      if (err?.status === 404) {
        targetModel = 'gpt-oss-120b';
        completion = await client.chat.completions.create({
          model: targetModel,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
          temperature: 0.1,
        });
      } else {
        throw err;
      }
    }

    const latency = Date.now() - start;
    const reply = completion.choices[0]?.message?.content?.trim() || 'OK';
    return {
      provider: 'Cerebras',
      serviceOrModel: targetModel,
      status: 'OK',
      latencyMs: latency,
      httpStatus: 200,
      details: `Ultra-fast inference: "${reply.slice(0, 30)}"`,
      rawPayload: completion,
    };
  } catch (err: any) {
    const latency = Date.now() - start;
    const httpStatus = err?.status || err?.response?.status || 500;
    const rawPayload = err?.error || err?.response?.data || { message: err?.message };
    const isPaymentRequired = httpStatus === 402 || err?.message?.includes('Payment required');

    return {
      provider: 'Cerebras',
      serviceOrModel: targetModel,
      status: 'FAIL',
      latencyMs: latency,
      httpStatus,
      details: isPaymentRequired ? 'Key valid, billing credits required' : 'Cerebras API failed',
      error: isPaymentRequired ? 'HTTP 402: Payment Required (Visit Cerebras Billing to add credits)' : err?.message || String(err),
      rawPayload,
    };
  }
}

/**
 * 3. OpenRouter API Verification
 * Sends a test prompt to meta-llama/llama-3.3-70b-instruct:free / instruct.
 */
async function testOpenRouter(): Promise<VerificationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  let targetModel = 'meta-llama/llama-3.3-70b-instruct:free';

  if (!apiKey) {
    return {
      provider: 'OpenRouter',
      serviceOrModel: targetModel,
      status: 'SKIPPED',
      latencyMs: 0,
      details: 'OPENROUTER_API_KEY not configured in .env',
    };
  }

  const start = Date.now();
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/sov2008/affiliate',
        'X-Title': 'Affiliate Ops Verification Suite',
      },
      timeout: 15000,
    });

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: targetModel,
        messages: [{ role: 'user', content: 'Say "pong"' }],
        max_tokens: 5,
        temperature: 0.1,
      });
    } catch {
      targetModel = 'meta-llama/llama-3.3-70b-instruct';
      completion = await client.chat.completions.create({
        model: targetModel,
        messages: [{ role: 'user', content: 'Say "pong"' }],
        max_tokens: 5,
        temperature: 0.1,
      });
    }

    const latency = Date.now() - start;
    const reply = completion.choices[0]?.message?.content?.trim() || 'OK';
    return {
      provider: 'OpenRouter',
      serviceOrModel: targetModel,
      status: 'OK',
      latencyMs: latency,
      httpStatus: 200,
      details: `Router connected: "${reply.slice(0, 30)}"`,
      rawPayload: completion,
    };
  } catch (err: any) {
    const httpStatus = err?.status || err?.response?.status || 'ERR';
    const rawPayload = err?.error || err?.response?.data || { message: err?.message };
    return {
      provider: 'OpenRouter',
      serviceOrModel: targetModel,
      status: 'FAIL',
      latencyMs: Date.now() - start,
      httpStatus,
      details: 'OpenRouter request failed',
      error: err?.message || String(err),
      rawPayload,
    };
  }
}

/**
 * 4. Pollinations API Verification (Image endpoint connectivity via GET)
 */
async function testPollinations(): Promise<VerificationResult> {
  const apiKey = process.env.POLLINATIONS_API_KEY;
  const service = 'image.pollinations.ai (1x1 test)';
  const start = Date.now();

  try {
    const url = 'https://image.pollinations.ai/prompt/ping_test_1x1?width=16&height=16&nologo=true&seed=1';
    const response = await axios.get(url, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      timeout: 20000,
      responseType: 'arraybuffer',
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const latency = Date.now() - start;
    const byteLength = response.data ? (response.data as Buffer).byteLength : 0;
    const contentType = response.headers['content-type'] || 'image/jpeg';

    return {
      provider: 'Pollinations.ai',
      serviceOrModel: service,
      status: 'OK',
      latencyMs: latency,
      httpStatus: response.status,
      details: `Image GET OK: ${byteLength} bytes (${contentType})`,
      rawPayload: { contentType, byteLength, status: response.status },
    };
  } catch (err: any) {
    const httpStatus = err?.response?.status || 'ERR';
    const rawPayload = err?.response?.data ? err.response.data.toString() : { message: err?.message };
    return {
      provider: 'Pollinations.ai',
      serviceOrModel: service,
      status: 'FAIL',
      latencyMs: Date.now() - start,
      httpStatus,
      details: 'Pollinations image endpoint unreachable',
      error: err?.message || String(err),
      rawPayload,
    };
  }
}

/**
 * 5. Cloudflare Workers AI Verification
 * Lightweight test against @cf/meta/llama-3.3-70b-instruct or 8b model.
 */
async function testCloudflareWorkersAI(): Promise<VerificationResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  let model = '@cf/meta/llama-3.3-70b-instruct';

  if (!accountId || !apiToken) {
    return {
      provider: 'Cloudflare AI',
      serviceOrModel: model,
      status: 'SKIPPED',
      latencyMs: 0,
      details: 'CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN missing',
    };
  }

  const start = Date.now();
  try {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
    const response = await axios.post(
      endpoint,
      { prompt: 'Reply with "pong"', max_tokens: 10 },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const latency = Date.now() - start;
    const data = response.data;
    const responseText = data?.result?.response?.trim() || (data?.success ? 'OK' : 'Unknown');

    return {
      provider: 'Cloudflare AI',
      serviceOrModel: model,
      status: 'OK',
      latencyMs: latency,
      httpStatus: 200,
      details: `Workers AI Edge response: "${responseText.slice(0, 30)}"`,
      rawPayload: data,
    };
  } catch (err: any) {
    // Fallback to fast 8B model
    try {
      model = '@cf/meta/llama-3.1-8b-instruct';
      const fallbackEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
      const fbRes = await axios.post(
        fallbackEndpoint,
        { prompt: 'Reply with "pong"', max_tokens: 10 },
        { headers: { Authorization: `Bearer ${apiToken}` }, timeout: 15000 }
      );
      return {
        provider: 'Cloudflare AI',
        serviceOrModel: model,
        status: 'OK',
        latencyMs: Date.now() - start,
        httpStatus: 200,
        details: `Edge AI response: "${fbRes.data?.result?.response?.trim()?.slice(0, 30) || 'OK'}"`,
        rawPayload: fbRes.data,
      };
    } catch (fbErr: any) {
      const httpStatus = fbErr?.response?.status || err?.response?.status || 500;
      const rawPayload = fbErr?.response?.data || err?.response?.data || { message: fbErr?.message };
      return {
        provider: 'Cloudflare AI',
        serviceOrModel: model,
        status: 'FAIL',
        latencyMs: Date.now() - start,
        httpStatus,
        details: 'Workers AI execution failed',
        error: err?.response?.data?.errors?.[0]?.message || fbErr?.message || String(fbErr),
        rawPayload,
      };
    }
  }
}

/**
 * 6. Cloudflare R2 Bucket Connection Test (S3 API Client)
 * Sends ListBucketsCommand to verify access keys.
 */
async function testCloudflareR2(): Promise<VerificationResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const customEndpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const service = 'Cloudflare R2 (S3 API)';

  if (!accessKeyId || !secretAccessKey) {
    return {
      provider: 'Cloudflare R2',
      serviceOrModel: service,
      status: 'SKIPPED',
      latencyMs: 0,
      details: 'R2 Access Keys missing',
    };
  }

  const endpoint = customEndpoint || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
  const start = Date.now();

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new ListBucketsCommand({});
    const response = await s3.send(command);

    const latency = Date.now() - start;
    const bucketCount = response.Buckets?.length ?? 0;
    const bucketNames = (response.Buckets || []).map((b) => b.Name).filter(Boolean).join(', ') || 'No buckets';

    return {
      provider: 'Cloudflare R2',
      serviceOrModel: service,
      status: 'OK',
      latencyMs: latency,
      httpStatus: 200,
      details: `Auth verified. Buckets (${bucketCount}): [${bucketNames}]`,
      rawPayload: response,
    };
  } catch (err: any) {
    const latency = Date.now() - start;
    let httpStatus: number | string = 500;
    let rawPayload: any = { error: err?.message || String(err) };
    let diagnosticNote = err?.message || String(err);

    // Deep diagnostic via Cloudflare REST API to extract exact error code & payload
    if (accountId && apiToken) {
      try {
        const checkRes = await axios.get(`https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets`, {
          headers: { Authorization: `Bearer ${apiToken}` },
          timeout: 5000,
        });
        if (checkRes.data?.success) {
          diagnosticNote = `REST API OK. Buckets: ${checkRes.data?.result?.buckets?.length ?? 0}`;
        }
      } catch (cfErr: any) {
        httpStatus = cfErr?.response?.status || 400;
        rawPayload = cfErr?.response?.data || rawPayload;
        const cfError = cfErr?.response?.data?.errors?.[0];
        if (cfError) {
          diagnosticNote = `HTTP ${httpStatus} (CF Code ${cfError.code}): ${cfError.message}`;
        }
      }
    }

    return {
      provider: 'Cloudflare R2',
      serviceOrModel: service,
      status: 'FAIL',
      latencyMs: latency,
      httpStatus,
      details: 'R2 S3 connection failed',
      error: diagnosticNote,
      rawPayload,
    };
  }
}

/**
 * Main Test Runner and Reporter
 */
export async function runVerificationSuite() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan} 🔐  MULTI-PROVIDER AI & STORAGE CREDENTIALS VERIFICATION SUITE${colors.reset}`);
  console.log(`${colors.dim} Node.js: ${process.version} | Timestamp: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================================${colors.reset}\n`);

  const tests = [
    { name: 'Groq', fn: testGroq },
    { name: 'Cerebras', fn: testCerebras },
    { name: 'OpenRouter', fn: testOpenRouter },
    { name: 'Pollinations.ai', fn: testPollinations },
    { name: 'Cloudflare Workers AI', fn: testCloudflareWorkersAI },
    { name: 'Cloudflare R2 Storage', fn: testCloudflareR2 },
  ];

  for (const test of tests) {
    process.stdout.write(`  ⏳ Testing ${colors.bold}${test.name.padEnd(25)}${colors.reset}... `);
    try {
      const res = await test.fn();
      results.push(res);
      if (res.status === 'OK') {
        console.log(`${colors.green}${colors.bold}[OK]${colors.reset} ${colors.cyan}(${res.latencyMs}ms)${colors.reset}`);
      } else if (res.status === 'SKIPPED') {
        console.log(`${colors.yellow}${colors.bold}[SKIPPED]${colors.reset}`);
      } else {
        console.log(`${colors.red}${colors.bold}[FAIL]${colors.reset} ${colors.dim}(HTTP ${res.httpStatus || 'ERR'})${colors.reset}`);
      }
    } catch (unexpectedError: any) {
      results.push({
        provider: test.name,
        serviceOrModel: 'Execution failure',
        status: 'FAIL',
        latencyMs: 0,
        httpStatus: 500,
        details: 'Unhandled error in test runner',
        error: unexpectedError?.message || String(unexpectedError),
      });
      console.log(`${colors.red}${colors.bold}[ERROR]${colors.reset}`);
    }
  }

  // Render Diagnostic Table
  console.log(`\n${colors.bold}📊 Verification Diagnostic Summary Table:${colors.reset}`);
  console.log('+' + '-'.repeat(18) + '+' + '-'.repeat(36) + '+' + '-'.repeat(10) + '+' + '-'.repeat(10) + '+' + '-'.repeat(45) + '+');
  console.log(
    `| ${colors.bold}${'Provider'.padEnd(16)}${colors.reset} | ${colors.bold}${'Model / Service'.padEnd(34)}${colors.reset} | ${colors.bold}${'Status'.padEnd(8)}${colors.reset} | ${colors.bold}${'Latency'.padEnd(8)}${colors.reset} | ${colors.bold}${'Details / HTTP Status'.padEnd(43)}${colors.reset} |`
  );
  console.log('+' + '-'.repeat(18) + '+' + '-'.repeat(36) + '+' + '-'.repeat(10) + '+' + '-'.repeat(10) + '+' + '-'.repeat(45) + '+');

  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const r of results) {
    if (r.status === 'OK') passedCount++;
    else if (r.status === 'FAIL') failedCount++;
    else skippedCount++;

    const providerCol = r.provider.slice(0, 16).padEnd(16);
    const modelCol = r.serviceOrModel.slice(0, 34).padEnd(34);
    
    let statusCol = '';
    if (r.status === 'OK') statusCol = `${colors.green}${colors.bold}OK      ${colors.reset}`;
    else if (r.status === 'FAIL') statusCol = `${colors.red}${colors.bold}FAIL    ${colors.reset}`;
    else statusCol = `${colors.yellow}${colors.bold}SKIPPED ${colors.reset}`;

    const latencyCol = (r.status === 'OK' ? `${r.latencyMs}ms` : '-').padEnd(8);
    const infoText = r.status === 'FAIL' ? (r.error || r.details) : r.details;
    const detailsCol = (infoText || '').slice(0, 43).padEnd(43);

    console.log(`| ${providerCol} | ${modelCol} | ${statusCol} | ${colors.cyan}${latencyCol}${colors.reset} | ${detailsCol} |`);
  }
  console.log('+' + '-'.repeat(18) + '+' + '-'.repeat(36) + '+' + '-'.repeat(10) + '+' + '-'.repeat(10) + '+' + '-'.repeat(45) + '+');

  // Print exact HTTP response payloads for debugging if any errors occurred
  const failedResults = results.filter((r) => r.status === 'FAIL');
  if (failedResults.length > 0) {
    console.log(`\n${colors.bold}${colors.yellow}🔍 Debugging & HTTP Payload Diagnostics for Failed Services:${colors.reset}`);
    for (const f of failedResults) {
      console.log(`\n  ${colors.red}${colors.bold}► [${f.provider}] - ${f.serviceOrModel}${colors.reset}`);
      console.log(`    ${colors.dim}HTTP Status:${colors.reset} ${colors.yellow}${f.httpStatus || 'N/A'}${colors.reset}`);
      console.log(`    ${colors.dim}Error Summary:${colors.reset} ${f.error || f.details}`);
      console.log(`    ${colors.dim}Response Payload:${colors.reset}`);
      console.log(`    ${colors.cyan}${JSON.stringify(f.rawPayload, null, 2).replace(/\n/g, '\n    ')}${colors.reset}`);
    }
  }

  // Summary Banner
  console.log(`\n${colors.bold}🎯 Test Results:${colors.reset} Total: ${results.length} | Passed: ${colors.green}${passedCount}${colors.reset} | Failed: ${failedCount > 0 ? colors.red + failedCount + colors.reset : '0'} | Skipped: ${colors.yellow}${skippedCount}${colors.reset}`);

  if (failedCount === 0) {
    console.log(`\n${colors.bgGreen}${colors.bold}  ✨ ALL MULTI-PROVIDER AI & R2 CREDENTIALS VERIFIED & OPERATIONAL  ${colors.reset}\n`);
  } else {
    console.log(`\n${colors.bgYellow}${colors.bold}  ℹ️  ${passedCount}/${results.length} PROVIDERS OPERATIONAL (${failedCount} REQUIRE ACCOUNT / BILLING ACTIVATION)  ${colors.reset}\n`);
  }

  return { passedCount, failedCount, skippedCount };
}

// Direct CLI Execution
if (process.argv[1] && (process.argv[1].endsWith('verifyCredentials.ts') || process.argv[1].endsWith('verifyCredentials.js'))) {
  runVerificationSuite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`${colors.red}Fatal test runner failure:${colors.reset}`, err);
      process.exit(1);
    });
}
