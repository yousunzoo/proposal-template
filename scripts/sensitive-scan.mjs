#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const defaultTargets = [
  "apps/web/src",
  "apps/web/public",
  "packages/shared/src",
  "README.md",
  "DESIGN.md",
  "docs/productization-roadmap.md",
];

const skipDirs = new Set([
  ".git",
  ".next",
  ".pnpm-store",
  ".turbo",
  "backup",
  "build",
  "dist",
  "node_modules",
  "out",
]);

const textExtensions = new Set([
  ".css",
  ".cjs",
  ".cts",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".mts",
  ".prisma",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml",
]);

const allowedUrlHosts = new Set([
  "127.0.0.1",
  "cdn.jsdelivr.net",
  "localhost",
]);

const builtInRules = [
  {
    name: "OpenAI-style API key",
    re: /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    name: "private key block",
    re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    name: "email address",
    re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    name: "Korean mobile phone number",
    re: /\b01[016789][-. ]?\d{3,4}[-. ]?\d{4}\b/g,
  },
  {
    name: "portfolio-specific public asset",
    re: /\/images\/portfolio\//g,
  },
];

function customTermRules() {
  const raw = process.env.SENSITIVE_TERMS ?? "";
  return raw
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term) => ({
      name: `custom term "${term}"`,
      re: new RegExp(escapeRegExp(term), "g"),
    }));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isTextFile(filePath) {
  return textExtensions.has(path.extname(filePath));
}

function walk(target) {
  const abs = path.resolve(root, target);
  if (!fs.existsSync(abs)) return [];

  const stat = fs.statSync(abs);
  if (stat.isFile()) return isTextFile(abs) ? [abs] : [];
  if (!stat.isDirectory()) return [];

  const files = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory() && skipDirs.has(entry.name)) continue;
    const child = path.join(abs, entry.name);
    if (entry.isDirectory()) files.push(...walk(path.relative(root, child)));
    else if (entry.isFile() && isTextFile(child)) files.push(child);
  }
  return files;
}

function lineNumber(content, index) {
  return content.slice(0, index).split("\n").length;
}

function urlFindings(content, file) {
  const findings = [];
  const re = /\bhttps?:\/\/[^\s"'<>)]*/g;
  let match;
  while ((match = re.exec(content))) {
    try {
      const url = new URL(match[0]);
      if (allowedUrlHosts.has(url.hostname)) continue;
    } catch {
      // Treat malformed URL-like text as suspicious.
    }
    findings.push({ file, line: lineNumber(content, match.index), rule: "external URL", value: match[0] });
  }
  return findings;
}

const targets = process.argv.slice(2);
const files = (targets.length ? targets : defaultTargets).flatMap(walk);
const rules = [...builtInRules, ...customTermRules()];
const findings = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file);
  findings.push(...urlFindings(content, rel));
  for (const rule of rules) {
    rule.re.lastIndex = 0;
    let match;
    while ((match = rule.re.exec(content))) {
      findings.push({
        file: rel,
        line: lineNumber(content, match.index),
        rule: rule.name,
        value: match[0],
      });
    }
  }
}

if (findings.length) {
  console.error("Sensitive content scan failed:");
  for (const f of findings) {
    console.error(`- ${f.file}:${f.line} [${f.rule}] ${f.value}`);
  }
  process.exit(1);
}

console.log(`Sensitive content scan passed (${files.length} files).`);
