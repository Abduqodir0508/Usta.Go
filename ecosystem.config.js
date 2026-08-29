module.exports = {
  apps: [
    {
      name: "usta-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      out_file: "./logs/web-out.log",
      error_file: "./logs/web-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    },
    {
      name: "usta-bot",
      script: "bot/index.js",
      env: {
        NODE_ENV: "production"
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      out_file: "./logs/bot-out.log",
      error_file: "./logs/bot-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
};
