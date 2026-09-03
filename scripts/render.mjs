#!/usr/bin/env node
// Renders a video config (data/videos/<file>.json) into out/<id>.mp4
// Usage: npm run render -- data/videos/demo-south-america.json
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const configArg = process.argv[2];
if (!configArg) {
  console.error("Uso: npm run render -- data/videos/<archivo>.json");
  process.exit(1);
}

const configPath = path.resolve(configArg);
const config = JSON.parse(readFileSync(configPath, "utf8"));

const outDir = path.join(root, "out");
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${config.id}.mp4`);

// The Composition's defaultProps shape is { config: VideoConfig }, so the
// props file passed to `remotion render` needs the same wrapper.
const propsPath = path.join(outDir, `.${config.id}.props.json`);
writeFileSync(propsPath, JSON.stringify({ config }));

const entry = path.join(root, "src", "index.ts");

// Some sandboxes block Remotion's own Chrome-Headless-Shell download. Reuse
// a pre-installed Chromium if we can find one instead of downloading.
const candidateBrowserPaths = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/opt/pw-browsers/chromium/chrome-linux/chrome",
].filter(Boolean);
const browserExecutable = candidateBrowserPaths.find((p) => existsSync(p));

const args = [
  "remotion",
  "render",
  entry,
  "MapVideo",
  outPath,
  `--props=${propsPath}`,
  // The camera moves constantly, so the default quality setting produces
  // very large files; 26 keeps them a few MB without visible degradation.
  "--crf=26",
];
if (browserExecutable) {
  args.push(`--browser-executable=${browserExecutable}`);
}

console.log(`Renderizando "${config.title}" -> ${outPath}`);
const result = spawnSync("npx", args, { stdio: "inherit", cwd: root });

process.exit(result.status ?? 1);
