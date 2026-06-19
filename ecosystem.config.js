module.exports = {
  apps: [
    {
      name: "jobmatching-frontend",
      script: "serve",
      env: {
        PM2_SERVE_PATH: "./apps/frontend/dist",
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html"
      }
    },
    {
      name: "jobmatching-backend",
      script: "./dist/main.js",
      cwd: "./apps/backend",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "jobmatching-ai-tools",
      script: "./.venv/bin/python",
      args: "-m uvicorn main:app --host 0.0.0.0 --port 8000",
      cwd: "./apps/ai-tools",
      interpreter: "none"
    }
  ]
};
