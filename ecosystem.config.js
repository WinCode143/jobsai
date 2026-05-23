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
        PORT: 3000,
      },
    },
    {
      name: "jobsai-worker",
      script: "src/jobs/sync-worker.ts",
      interpreter: "node",
      interpreter_args: "--import tsx/esm",
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
