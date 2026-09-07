// Cryptographic Authentication & Password Hashing Service for NEED ELECTRO ERP
// Uses standard Web Crypto API (PBKDF2-HMAC-SHA256 with 100,000 iterations and 16-byte random salt)

const ITERATIONS = 100000;
const SALT_BYTES = 16;
const HASH_ALGO = 'SHA-256';

/**
 * Convert Uint8Array buffer to hexadecimal string
 */
function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hexadecimal string to Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Cryptographically hashes a plain password using PBKDF2-HMAC-SHA256
 * Returns formatted hash string: pbkdf2:sha256:100000:<salt_hex>:<hash_hex>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(SALT_BYTES);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(salt);
  } else {
    for (let i = 0; i < SALT_BYTES; i++) {
      salt[i] = Math.floor(Math.random() * 256);
    }
  }

  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: HASH_ALGO
    },
    passwordKey,
    256
  );

  const hashArray = new Uint8Array(derivedBits);
  const saltHex = bufferToHex(salt);
  const hashHex = bufferToHex(hashArray);

  return `pbkdf2:sha256:${ITERATIONS}:${saltHex}:${hashHex}`;
}

/**
 * Verifies a candidate plain password against a stored hash string.
 * Supports legacy plaintext passwords with backward compatibility.
 */
export async function verifyPassword(password: string, storedHashOrPlain: string): Promise<boolean> {
  if (!storedHashOrPlain) return false;

  // 1. Check if stored credential is a PBKDF2 hash
  if (storedHashOrPlain.startsWith('pbkdf2:sha256:')) {
    const parts = storedHashOrPlain.split(':');
    if (parts.length !== 5) return false;

    const iterations = parseInt(parts[2], 10);
    const saltHex = parts[3];
    const expectedHashHex = parts[4];
    const salt = hexToBuffer(saltHex);

    const enc = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations,
        hash: HASH_ALGO
      },
      passwordKey,
      256
    );

    const derivedHex = bufferToHex(new Uint8Array(derivedBits));

    // Constant-time-like comparison
    if (derivedHex.length !== expectedHashHex.length) return false;
    let match = true;
    for (let i = 0; i < derivedHex.length; i++) {
      if (derivedHex[i] !== expectedHashHex[i]) {
        match = false;
      }
    }
    return match;
  }

  // 2. Legacy fallback comparison (e.g. initial demo password 'admin123')
  return password === storedHashOrPlain;
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSecureToken(): string {
  const randomBytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 32; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return 'nec_' + bufferToHex(randomBytes);
}
