import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const DIGITS = 6;
const PERIOD_SECONDS = 30;
const WINDOW = 1;
const SECRET_BYTES = 20;
const RECOVERY_COUNT = 8;

export function encodeBase32(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function decodeBase32(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of cleaned) {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) {
      throw new Error("Invalid authenticator secret.");
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return encodeBase32(randomBytes(SECRET_BYTES));
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

export function totpAt(secret: string, atMs: number): string {
  const counter = Math.floor(atMs / 1000 / PERIOD_SECONDS);
  return hotp(decodeBase32(secret), counter);
}

export function verifyTotp(secret: string, code: string, atMs = Date.now()): boolean {
  const trimmed = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(trimmed)) {
    return false;
  }
  const given = Buffer.from(trimmed);
  for (let drift = -WINDOW; drift <= WINDOW; drift += 1) {
    const expected = Buffer.from(totpAt(secret, atMs + drift * PERIOD_SECONDS * 1000));
    if (expected.length === given.length && timingSafeEqual(expected, given)) {
      return true;
    }
  }
  return false;
}

export function otpauthUrl(email: string, secret: string): string {
  const label = encodeURIComponent(`Desk:${email}`);
  const issuer = encodeURIComponent("Desk");
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${DIGITS}&period=${PERIOD_SECONDS}`;
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_COUNT }, () => {
    const hex = randomBytes(4).toString("hex");
    return `${hex.slice(0, 4)}-${hex.slice(4)}`;
  });
}

export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(normalizeRecoveryCode(code)).digest("hex");
}

export function normalizeRecoveryCode(code: string): string {
  return code.trim().toLowerCase().replace(/\s+/g, "");
}

export function recoveryCodeMatches(code: string, hashes: string[]): string | null {
  const given = hashRecoveryCode(code);
  const givenBuf = Buffer.from(given);
  for (const stored of hashes) {
    const storedBuf = Buffer.from(stored);
    if (storedBuf.length === givenBuf.length && timingSafeEqual(storedBuf, givenBuf)) {
      return stored;
    }
  }
  return null;
}

export function parseRecoveryHashes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}
