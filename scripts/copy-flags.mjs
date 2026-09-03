#!/usr/bin/env node
// Copies the flag-icons SVGs into public/flags so Remotion can serve them
// via staticFile() both in Studio preview and in headless renders.
// Run with: npm run sync:flags
import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "node_modules", "flag-icons", "flags", "4x3");
const dest = path.join(root, "public", "flags");

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

console.log(`Copied flags from ${src} -> ${dest}`);
