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

module.exports = {
  apps: [
    {
      name: "affiliate-dashboard",
      script: "./dist/dashboard-server.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-dashboard-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-dashboard-error.log"),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        PLAYWRIGHT_HEADLESS: "true"
      }
    },
    {
      name: "affiliate-scheduler",
      script: "./dist/automation/distribution-scheduler.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-scheduler-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-scheduler-error.log"),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        PLAYWRIGHT_HEADLESS: "true"
      }
    },
    {
      name: "affiliate-health-monitor",
      script: "./dist/automation/post-health-monitor.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-health-monitor-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-health-monitor-error.log"),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        PLAYWRIGHT_HEADLESS: "true"
      }
    },
    {
      name: "affiliate-telegram-bot",
      script: "./dist/services/telegram-control-bot.service.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-telegram-bot-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-telegram-bot-error.log"),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        PLAYWRIGHT_HEADLESS: "true"
      }
    },
    {
      name: "affiliate-autopilot",
      script: "./dist/autopilot-daemon.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_memory_restart: "450M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-autopilot-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-autopilot-error.log"),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        PLAYWRIGHT_HEADLESS: "true"
      }
    },
    {
      name: "affiliate-telegram-userbot",
      script: "./dist/services/telegram-userbot.service.js",
      cwd: coreDir,
      instances: 1,
      autorestart: true,
      max_memory_restart: "100M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 500,
      out_file: path.join(logsDir, "pm2-affiliate-telegram-userbot-out.log"),
      error_file: path.join(logsDir, "pm2-affiliate-telegram-userbot-error.log"),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
