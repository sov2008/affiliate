const path = require('path');

module.exports = {
  apps: [
    {
      name: "affiliate-dashboard",
      script: "./core/dist/dashboard-server.js",
      cwd: path.resolve(__dirname, 'core'),
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      restart_delay: 2000,
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "affiliate-scheduler",
      script: "./core/dist/automation/distribution-scheduler.js",
      cwd: path.resolve(__dirname, 'core'),
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      exp_backoff_restart_delay: 500,
      restart_delay: 3000,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "affiliate-health-monitor",
      script: "./core/dist/automation/post-health-monitor.js",
      cwd: path.resolve(__dirname, 'core'),
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      exp_backoff_restart_delay: 500,
      restart_delay: 3000,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "affiliate-telegram-bot",
      script: "./core/dist/services/telegram-control-bot.service.js",
      cwd: path.resolve(__dirname, 'core'),
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      exp_backoff_restart_delay: 500,
      restart_delay: 3000,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
