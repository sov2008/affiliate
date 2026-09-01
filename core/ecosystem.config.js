const path = require('path');

module.exports = {
  apps: [
    {
      name: "affiliate-dashboard",
      script: "./dist/dashboard-server.js",
      cwd: __dirname,
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
      script: "./dist/automation/distribution-scheduler.js",
      cwd: __dirname,
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
      script: "./dist/automation/post-health-monitor.js",
      cwd: __dirname,
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
      script: "./dist/services/telegram-control-bot.service.js",
      cwd: __dirname,
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
