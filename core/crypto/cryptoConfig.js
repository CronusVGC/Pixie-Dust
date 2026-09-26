/**
 * PIXIE DUST - Cryptographic Configuration
 * Preserves the exact parameters of the original engine.
 * 
 * Source of truth: backup/pixie-dust-original.html
 * 
 * Rules:
 * - NO UI dependencies.
 * - Pure configuration constants.
 */

export const CRYPTO_CONFIG = {
  // Key Derivation (PBKDF2-HMAC-SHA256)
  // Lines 587-595 of pixie-dust-original.html
  PBKDF2_ITERATIONS: 100000,
  PBKDF2_HASH: 'SHA-256',
  DERIVED_BITS: 288,          // 36 bytes: 32 bytes master key + 4 bytes verifier tag
  MASTER_KEY_BYTES: 32,
  VERIFIER_TAG_BYTES: 4,
  SALT_BYTES: 16,             // Lines 751-752: crypto.getRandomValues(new Uint8Array(16))

  // LSB Steganography Header
  // Lines 639-673 of pixie-dust-original.html
  HEADER_BYTES: 20,           // 16 bytes salt + 4 bytes verifier tag
  HEADER_CHANNELS: 160,       // 20 bytes * 8 bits = 160 color channels (RGB only, skipping Alpha)
  BACKUP_CHANNELS: 160,       // Channels 160..319: 160 color channels for original LSB preservation
  TOTAL_HEADER_CHANNELS: 320, // 160 header + 160 backup = 320 channels total
  MIN_REQUIRED_PIXELS: 107,   // Math.ceil(320 / 3) = 107 pixels minimum to embed header without overflow

  // Processing batch size for cooperative execution / progress reporting
  CHUNK_SIZE: 100000          // Lines 768, 815, 883, 920: chunkSize = 100000
};
