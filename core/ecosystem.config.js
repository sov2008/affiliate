module.exports = {
  apps: [
    {
      name: "affiliate-dashboard",
      script: "./dist/dashboard-server.js",
      cwd: "/root/affiliate/core",
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
      cwd: "/root/affiliate/core",
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
      cwd: "/root/affiliate/core",
      instances: 1,
      autorestart: true,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
