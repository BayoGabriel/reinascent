import "server-only";

import { argon2id } from "hash-wasm";
import { randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Argon2id password hashing via hash-wasm (pure WASM: no native toolchain,
 * identical in dev, CI, and production). Hashes are stored in PHC string
 * format so parameters and salt travel with the hash.
 */
const ARGON2_VERSION = 19;
const MEMORY_SIZE_KIB = 19_456;
const ITERATIONS = 2;
const PARALLELISM = 1;
const HASH_LENGTH = 32;
const SALT_LENGTH = 16;

const PHC_PATTERN =
  /^\$argon2id\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/=]+)\$([A-Za-z0-9+/=]+)$/;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await argon2id({
    password,
    salt,
    parallelism: PARALLELISM,
    memorySize: MEMORY_SIZE_KIB,
    iterations: ITERATIONS,
    hashLength: HASH_LENGTH,
    outputType: "binary",
  });
  const encodedSalt = salt.toString("base64");
  const encodedHash = Buffer.from(hash).toString("base64");
  return `$argon2id$v=${ARGON2_VERSION}$m=${MEMORY_SIZE_KIB},t=${ITERATIONS},p=${PARALLELISM}$${encodedSalt}$${encodedHash}`;
}

export async function verifyPassword(
  password: string,
  encoded: string,
): Promise<boolean> {
  const match = PHC_PATTERN.exec(encoded);
  if (!match) return false;
  const [, version, memory, iterations, parallelism, saltB64, hashB64] = match;
  if (Number(version) !== ARGON2_VERSION) return false;

  const expected = Buffer.from(hashB64, "base64");
  const actual = await argon2id({
    password,
    salt: Buffer.from(saltB64, "base64"),
    parallelism: Number(parallelism),
    memorySize: Number(memory),
    iterations: Number(iterations),
    hashLength: expected.length,
    outputType: "binary",
  });
  const actualBuf = Buffer.from(actual);
  return (
    actualBuf.length === expected.length &&
    timingSafeEqual(actualBuf, expected)
  );
}
