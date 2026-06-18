module.exports = {
  apps: [
    {
      name: "kashrut-app",
      script: "node_modules/next/dist/bin/next",
      args: "dev",
      cwd: __dirname,
      interpreter: "node",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
    },
  ],
};
