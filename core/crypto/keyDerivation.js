/**
 * PIXIE DUST - Key Derivation Module
 * 
 * Preserves the exact WebCrypto PBKDF2 logic from backup/pixie-dust-original.html (Lines 578-601, 751-752, 856-863).
 * 
 * Rules:
 * - Pure cryptographic logic
 * - NO UI dependencies
 * - NO circular dependencies
 */

import { CRYPTO_CONFIG } from './cryptoConfig.js';

/**
 * Generate a cryptographically secure random 16-byte salt.
 * Matches backup/pixie-dust-original.html line 751-752.
 * @returns {Uint8Array} 16-byte random salt
 */
export function generateSalt() {
  const salt = new Uint8Array(CRYPTO_CONFIG.SALT_BYTES);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Derive 256-bit masterKey and 32-bit verifierTag using PBKDF2-HMAC-SHA256.
 * Matches backup/pixie-dust-original.html lines 578-601 exactly.
 * 
 * @param {string} password - User provided passphrase
 * @param {Uint8Array} salt - 16-byte salt
 * @returns {Promise<{masterKey: Uint8Array, verifierTag: Uint8Array}>}
 */
export async function deriveKeyAndVerifier(password, salt) {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
      hash: CRYPTO_CONFIG.PBKDF2_HASH
    },
    baseKey,
    CRYPTO_CONFIG.DERIVED_BITS // 288 bits = 36 bytes (32B master key + 4B verifier tag)
  );
  
  const derivedArray = new Uint8Array(derivedBits);
  const masterKey = derivedArray.slice(0, CRYPTO_CONFIG.MASTER_KEY_BYTES);
  const verifierTag = derivedArray.slice(
    CRYPTO_CONFIG.MASTER_KEY_BYTES, 
    CRYPTO_CONFIG.MASTER_KEY_BYTES + CRYPTO_CONFIG.VERIFIER_TAG_BYTES
  );
  
  return { masterKey, verifierTag };
}

/**
 * Verify tag matches expected verifier.
 * Matches backup/pixie-dust-original.html lines 857-863.
 * 
 * @param {Uint8Array} verifier - Extracted verifier from LSB
 * @param {Uint8Array} verifierTag - Derived verifier from entered passphrase
 * @returns {boolean} True if verifier matches exactly
 */
export function verifyVerifierTag(verifier, verifierTag) {
  if (!verifier || !verifierTag || verifier.length < 4 || verifierTag.length < 4) {
    return false;
  }
  let verified = true;
  for (let i = 0; i < CRYPTO_CONFIG.VERIFIER_TAG_BYTES; i++) {
    if (verifier[i] !== verifierTag[i]) {
      verified = false;
      break;
    }
  }
  return verified;
}
