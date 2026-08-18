/**
 * 관리자 세션 — 상태 없는 서명 토큰(HMAC-SHA256).
 * Web Crypto만 사용하므로 Edge 미들웨어와 Node 라우트 핸들러 양쪽에서 동작한다.
 */

export const SESSION_COOKIE = 'admin_session';
/** 세션 유효기간(초) — 기본 12시간 */
export const SESSION_TTL = 60 * 60 * 12;

const encoder = new TextEncoder();

/** UTF-8 바이트를 ArrayBuffer 기반 Uint8Array로 반환(BufferSource 호환) */
function raw(s: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(encoder.encode(s));
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(str: string): Uint8Array<ArrayBuffer> {
  const norm = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = norm.length % 4 ? 4 - (norm.length % 4) : 0;
  const bin = atob(norm + '='.repeat(pad));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    raw(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/** 서명된 세션 토큰 생성 */
export async function createSession(secret: string, ttlSec: number = SESSION_TTL): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const payload = b64url(raw(JSON.stringify({ exp })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), raw(payload));
  return `${payload}.${b64url(sig)}`;
}

/** 세션 토큰 검증(서명 + 만료) */
export async function verifySession(secret: string, token: string | undefined | null): Promise<boolean> {
  if (!secret || !token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      fromB64url(sig),
      raw(payload),
    );
  } catch {
    return false;
  }
  if (!valid) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { exp?: number };
    return typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** 길이·값 상수시간 비교(타이밍 공격 완화) */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
