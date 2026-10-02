const path = require('path');
const fs = require('fs');

try {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
  require('dotenv').config({ path: path.resolve(__dirname, 'core/.env') });
} catch (e) {}

const logsDir = path.resolve(__dirname, '.antigravity', 'logs');

if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (e) {}
}

const coreDir = path.resolve(__dirname, 'core');

// Shared concurrency and database protection defaults
const sharedEnv = {
  NODE_ENV: "production",
  PLAYWRIGHT_HEADLESS: "true",
  SQLITE_BUSY_TIMEOUT: "15000",
  SQLITE_WAL_MODE: "true"
};

module.exports = {
  apps: [
    {
      name: "affiliate-dashboard",
      script: "./dist/dashboard-server.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "15s",
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-dashboard-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-dashboard-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv,
        PORT: 5000,
        HOST: "127.0.0.1"
      }
    },
    {
      name: "affiliate-scheduler",
      script: "./dist/automation/distribution-scheduler.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "15s",
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-scheduler-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-scheduler-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv
      }
    },
    {
      name: "affiliate-health-monitor",
      script: "./dist/automation/post-health-monitor.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "15s",
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-health-monitor-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-health-monitor-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv
      }
    },
    {
      name: "affiliate-telegram-bot",
      script: "./dist/services/telegram-control-bot.service.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "15s",
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-telegram-bot-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-telegram-bot-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv
      }
    },
    {
      name: "affiliate-autopilot",
      script: "./dist/autopilot-daemon.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "15s",
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-autopilot-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-autopilot-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv
      }
    },
    {
      name: "affiliate-autonomous-agent",
      script: "./dist/run-autonomous-agent.js",
      args: "--daemon",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "30s",
      max_memory_restart: "450M",
      restart_delay: 10000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-autonomous-agent-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-autonomous-agent-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv
      }
    },
    {
      name: "affiliate-telegram-userbot",
      script: "./dist/services/telegram-userbot.service.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "15s",
      max_memory_restart: "100M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-telegram-userbot-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-telegram-userbot-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv
      }
    },
    {
      name: "affiliate-social-syndicator",
      script: "./dist/workers/social-syndicator.worker.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "15s",
      max_memory_restart: "150M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-social-syndicator-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-social-syndicator-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv
      }
    },
    {
      name: "affiliate-pinterest-publisher",
      script: "../scripts/pinterest-worker.cjs",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "30s",
      max_memory_restart: "400M",
      restart_delay: 10000,
      exp_backoff_restart_delay: 1000,
      out_file: path.join(logsDir, "pm2-affiliate-pinterest-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-pinterest-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv,
        HEADLESS: "true"
      }
    },
    {
      name: "affiliate-twitter-publisher",
      script: "./dist/workers/twitter-publisher.worker.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "30s",
      max_memory_restart: "450M",
      restart_delay: 10000,
      exp_backoff_restart_delay: 1000,
      out_file: path.join(logsDir, "pm2-affiliate-twitter-publisher-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-twitter-publisher-error.log"),
      merge_logs: true,
      time: true,
      env: {
        ...sharedEnv,
        TWITTER_PUBLISH_INTERVAL_MINUTES: "30"
      }
    }
  ]
};
