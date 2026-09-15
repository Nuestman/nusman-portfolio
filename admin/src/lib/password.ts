import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const MIN_PASSWORD_LENGTH = 8;

export function passwordTooShort(value: string): boolean {
  return value.length < MIN_PASSWORD_LENGTH;
}

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3) {
    return false;
  }
  const [scheme, saltHex, hashHex] = parts;
  if (scheme !== "scrypt" || !saltHex || !hashHex) {
    return false;
  }

  const hash = scryptSync(plain, Buffer.from(saltHex, "hex"), KEY_LENGTH);
  const expected = Buffer.from(hashHex, "hex");
  if (hash.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(hash, expected);
}
