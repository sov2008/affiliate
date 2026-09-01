const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const logsDir = path.join(rootDir, '.antigravity', 'logs');

if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (e) {}
}

module.exports = {
  apps: [
    {
      name: "affiliate-dashboard",
      script: "./dist/dashboard-server.js",
      cwd: __dirname,
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
      cwd: __dirname,
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
      cwd: __dirname,
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
      cwd: __dirname,
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
      cwd: __dirname,
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
    }
  ]
};
