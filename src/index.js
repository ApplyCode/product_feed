import http from "http";
import fs from "fs/promises";
import path from "path";
import { config } from "./config.js";
import { generateAndPublish } from "./generate.js";

const REFRESH_MS = 24 * 60 * 60 * 1000;

async function runGenerate() {
  try {
    await generateAndPublish();
  } catch (err) {
    console.error("Feed generation failed:");
    console.error(err.message || err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

async function runSchedule() {
  console.log("Running initial feed generation...");
  await runGenerate();

  console.log(`Scheduling refresh every 24 hours.`);
  setInterval(() => {
    console.log(`[${new Date().toISOString()}] Refreshing feed...`);
    runGenerate();
  }, REFRESH_MS);
}

async function runServe() {
  const filePath = path.resolve(config.publish.outputPath);

  const refresh = async () => {
    console.log("Generating feed before serve...");
    await generateAndPublish();
  };

  await refresh();

  const server = http.createServer(async (req, res) => {
    const urlPath = new URL(req.url || "/", "http://localhost").pathname;
    if (urlPath !== config.serve.path) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    try {
      const csv = await fs.readFile(filePath, "utf8");
      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
      res.end(csv);
    } catch {
      res.writeHead(503, { "Content-Type": "text/plain" });
      res.end("Feed not ready");
    }
  });

  setInterval(() => {
    console.log(`[${new Date().toISOString()}] Refreshing feed...`);
    refresh().catch((err) => console.error(err));
  }, REFRESH_MS);

  server.listen(config.serve.port, () => {
    const base = `http://localhost:${config.serve.port}`;
    console.log(`Serving Tolstoy CSV at ${base}${config.serve.path}`);
    console.log("Use your public reverse proxy or tunnel for a stable external URL.");
  });
}

const command = process.argv[2] || "generate";

switch (command) {
  case "generate":
    await runGenerate();
    break;
  case "schedule":
    await runSchedule();
    break;
  case "serve":
    await runServe();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error("Usage: node src/index.js [generate|schedule|serve]");
    process.exitCode = 1;
}
