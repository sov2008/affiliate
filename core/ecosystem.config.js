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
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "affiliate-autopilot",
      script: "./dist/autopilot-daemon.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "affiliate-organic-daemon",
      script: "./dist/skills/organic-traffic-agent-skill.js",
      args: "--daemon",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      exp_backoff_restart_delay: 200,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};

