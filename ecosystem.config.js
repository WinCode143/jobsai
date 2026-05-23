module.exports = {
  apps: [
    {
      name: "jobsai-web",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/jobsai",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "jobsai-worker",
      script: "node_modules/.bin/tsx",
      args: "src/jobs/sync-worker.ts",
      cwd: "/var/www/jobsai",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
