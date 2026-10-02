#!/usr/bin/env node
/**
 * Static export cannot include Route Handlers. Park src/app/api during
 * GitHub Pages builds, then restore afterward.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "src", "app", "api");
const parkDir = path.join(root, ".gh-pages-park", "api");
const mode = process.argv[2];

if (mode === "park") {
  if (!fs.existsSync(apiDir)) {
    console.log("No api/ to park");
    process.exit(0);
  }
  fs.mkdirSync(path.dirname(parkDir), { recursive: true });
  if (fs.existsSync(parkDir)) fs.rmSync(parkDir, { recursive: true, force: true });
  fs.renameSync(apiDir, parkDir);
  console.log("Parked src/app/api for static export");
  process.exit(0);
}

if (mode === "restore") {
  if (!fs.existsSync(parkDir)) {
    console.log("Nothing to restore");
    process.exit(0);
  }
  if (fs.existsSync(apiDir)) fs.rmSync(apiDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(apiDir), { recursive: true });
  fs.renameSync(parkDir, apiDir);
  fs.rmSync(path.join(root, ".gh-pages-park"), { recursive: true, force: true });
  console.log("Restored src/app/api");
  process.exit(0);
}

console.error("Usage: node scripts/gh-pages-api.mjs park|restore");
process.exit(1);
