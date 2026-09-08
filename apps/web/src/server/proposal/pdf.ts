import fs from 'node:fs/promises';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import { chromium as playwrightChromium } from 'playwright-core';

const PDF_WIDTH = 1440;
const PDF_HEIGHT = 1080;

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findPlaywrightCacheExecutable(): Promise<string | null> {
  const home = process.env.HOME;
  if (!home) return null;

  const cacheRoot =
    process.platform === 'darwin'
      ? path.join(home, 'Library/Caches/ms-playwright')
      : path.join(home, '.cache/ms-playwright');

  let entries: string[];
  try {
    entries = await fs.readdir(cacheRoot);
  } catch {
    return null;
  }

  const candidates: string[] = [];
  for (const entry of entries) {
    if (!entry.startsWith('chromium')) continue;
    const base = path.join(cacheRoot, entry);
    if (process.platform === 'darwin') {
      candidates.push(
        path.join(base, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
        path.join(base, 'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'),
      );
    } else {
      candidates.push(
        path.join(base, 'chrome-linux/chrome'),
        path.join(base, 'chrome-linux/chrome-linux/chrome'),
      );
    }
  }

  for (const candidate of candidates) {
    if (await pathExists(candidate)) return candidate;
  }
  return null;
}

async function resolveLocalExecutablePath(): Promise<string | null> {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH;

  const candidates =
    process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        ]
      : [
          '/usr/bin/google-chrome-stable',
          '/usr/bin/google-chrome',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium',
        ];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) return candidate;
  }

  return findPlaywrightCacheExecutable();
}

async function resolveExecutablePath(): Promise<{ executablePath: string; args: string[] }> {
  const localExecutablePath = await resolveLocalExecutablePath();
  if (localExecutablePath) return { executablePath: localExecutablePath, args: [] };

  return {
    executablePath: await chromium.executablePath(),
    args: chromium.args,
  };
}

/** PDF 파일명으로 안전한 문자열 생성 (경로/제어 문자 제거) */
export function safePdfFilename(title: string): string {
  const base =
    title
      .replace(/[\\/:*?"<>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80) || 'proposal';
  return `${base}.pdf`;
}

interface RenderOptions {
  /** 인증이 필요한 print 페이지(예: /proposals/[id]/print)를 헤드리스 브라우저로 열 때 전달할 쿠키 */
  cookies?: { name: string; value: string }[];
}

export async function renderProposalPdf(url: string, options?: RenderOptions): Promise<Buffer> {
  const { executablePath, args } = await resolveExecutablePath();
  const browser = await playwrightChromium.launch({
    args,
    executablePath,
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: PDF_WIDTH, height: PDF_HEIGHT },
      deviceScaleFactor: 1,
    });
    if (options?.cookies?.length) {
      const origin = new URL(url).origin;
      await context.addCookies(options.cookies.map((c) => ({ ...c, url: origin })));
    }
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({
      width: `${PDF_WIDTH}px`,
      height: `${PDF_HEIGHT}px`,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1,
    });
    await page.close();
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
