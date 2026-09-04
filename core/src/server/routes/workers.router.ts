import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export const workersRouter = Router();

export const ALLOWED_SERVICES = [
  'scout-reddit-worker',
  'reddit-session-watchdog',
  'affiliate-scheduler',
  'affiliate-telegram-bot',
] as const;

export type AllowedService = (typeof ALLOWED_SERVICES)[number];

export const ALLOWED_ACTIONS = ['start', 'stop', 'restart'] as const;
export type AllowedAction = (typeof ALLOWED_ACTIONS)[number];

export interface WorkerProcessStatus {
  name: string;
  status: 'online' | 'stopped' | 'errored' | 'launching' | 'unknown';
  pm_id: number;
  uptime: number;
  uptimeFormatted: string;
  memory: number;
  memoryFormatted: string;
  restarts: number;
  cpu: number;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatUptime(uptimeTimestampMs: number): string {
  if (!uptimeTimestampMs || uptimeTimestampMs <= 0) return '0s';
  const diffSec = Math.floor((Date.now() - uptimeTimestampMs) / 1000);
  if (diffSec < 0) return '0s';
  if (diffSec < 60) return `${diffSec}s`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`;
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Helper to fetch raw PM2 processes from CLI
 */
async function getPm2Processes(): Promise<any[]> {
  try {
    const { stdout } = await execAsync('pm2 jlist');
    const raw = stdout.trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err: any) {
    console.warn('[WorkersRouter] Could not execute pm2 jlist:', err.message);
    return [];
  }
}

/**
 * 1. GET /api/workers/status
 * Returns list of processes and their runtime metrics
 */
workersRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const pm2List = await getPm2Processes();

    // Map all found processes
    const workersMap = new Map<string, WorkerProcessStatus>();

    for (const p of pm2List) {
      const name = p.name;
      const status = (p.pm2_env?.status || 'unknown') as WorkerProcessStatus['status'];
      const uptimeMs = Number(p.pm2_env?.pm_uptime || 0);
      const memoryBytes = Number(p.monit?.memory || 0);

      workersMap.set(name, {
        name,
        status,
        pm_id: Number(p.pm_id ?? -1),
        uptime: uptimeMs,
        uptimeFormatted: status === 'online' ? formatUptime(uptimeMs) : '0s',
        memory: memoryBytes,
        memoryFormatted: formatBytes(memoryBytes),
        restarts: Number(p.pm2_env?.restart_time || 0),
        cpu: Number(p.monit?.cpu || 0),
      });
    }

    // Ensure all whitelist services have at least a placeholder entry even if unspawned
    const result: WorkerProcessStatus[] = [];
    for (const service of ALLOWED_SERVICES) {
      if (workersMap.has(service)) {
        result.push(workersMap.get(service)!);
      } else {
        result.push({
          name: service,
          status: 'stopped',
          pm_id: -1,
          uptime: 0,
          uptimeFormatted: '0s',
          memory: 0,
          memoryFormatted: '0 B',
          restarts: 0,
          cpu: 0,
        });
      }
    }

    // Also include any other non-whitelisted affiliate processes running in PM2
    for (const [name, info] of workersMap.entries()) {
      if (!ALLOWED_SERVICES.includes(name as any)) {
        result.push(info);
      }
    }

    return res.status(200).json({
      success: true,
      workers: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('❌ [WorkersRouter:status] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 2. POST /api/workers/:service/:action
 * Safely executes start | stop | restart on whitelist services
 */
workersRouter.post('/:service/:action', async (req: Request, res: Response) => {
  const service = req.params.service || req.params.name;
  const action = req.params.action;

  // Strict whitelist validation
  if (!ALLOWED_SERVICES.includes(service as any)) {
    return res.status(400).json({
      success: false,
      error: `Service '${service}' is not in allowed whitelist: [${ALLOWED_SERVICES.join(', ')}]`,
    });
  }

  if (!ALLOWED_ACTIONS.includes(action as any)) {
    return res.status(400).json({
      success: false,
      error: `Action '${action}' is not supported. Allowed actions: [${ALLOWED_ACTIONS.join(', ')}]`,
    });
  }

  try {
    console.log(`⚡ [WorkersRouter] Executing pm2 ${action} for ${service}...`);
    // Safe execution: service and action are verified against strict string enums
    const { stdout, stderr } = await execAsync(`pm2 ${action} ${service}`);

    // Fetch updated process info
    const pm2List = await getPm2Processes();
    const updated = pm2List.find((p) => p.name === service);
    const newStatus = updated?.pm2_env?.status || (action === 'stop' ? 'stopped' : 'online');

    console.log(`✅ [WorkersRouter] Service ${service} is now ${newStatus}`);

    return res.status(200).json({
      success: true,
      service,
      action,
      status: newStatus,
      pm_id: updated?.pm_id,
      restarts: updated?.pm2_env?.restart_time,
      message: `Worker ${service} ${action} executed successfully. Status: ${newStatus}`,
      stdout: stdout.trim().slice(-300),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`❌ [WorkersRouter:${action}] Failed for ${service}:`, err.message);
    return res.status(500).json({
      success: false,
      service,
      action,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});
