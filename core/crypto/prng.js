/**
 * PIXIE DUST - Pseudo-Random Number Generator (PRNG)
 * 
 * Source of truth: backup/pixie-dust-original.html (Lines 603-631)
 * 
 * Implementation: Xoshiro128** (32-bit state words, deterministic)
 * Seeded with masterKey derived from PBKDF2.
 * 
 * Rules:
 * - NO UI dependencies
 * - NO external library dependencies
 * - Preserves exact bitwise operations and constants
 */

export class Xoshiro128PRNG {
  /**
   * Initialize PRNG with 32-byte key
   * Matches backup/pixie-dust-original.html lines 604-610
   * @param {Uint8Array} keyBytes - 32-byte master key
   */
  constructor(keyBytes) {
    const view = new DataView(keyBytes.buffer, keyBytes.byteOffset, 32);
    this.s0 = view.getUint32(0, true) || 0x12345678;
    this.s1 = view.getUint32(4, true) || 0x9ABCDEF0;
    this.s2 = view.getUint32(8, true) || 0x13579BDF;
    this.s3 = view.getUint32(12, true) || 0x2468ACE0;
  }

  /**
   * Rotate left 32-bit
   * Matches backup/pixie-dust-original.html lines 611-613
   */
  rotl(x, k) {
    return (x << k) | (x >>> (32 - k));
  }

  /**
   * Generate next 32-bit unsigned integer
   * Matches backup/pixie-dust-original.html lines 614-624
   * @returns {number} 32-bit unsigned integer
   */
  nextUint32() {
    const result = Math.imul(this.rotl(Math.imul(this.s1, 5), 7), 9) >>> 0;
    const t = this.s1 << 9;
    this.s2 ^= this.s0;
    this.s3 ^= this.s1;
    this.s1 ^= this.s2;
    this.s0 ^= this.s3;
    this.s2 ^= t;
    this.s3 = this.rotl(this.s3, 11);
    return result;
  }

  /**
   * Generate float in range [0, 1)
   * Matches backup/pixie-dust-original.html lines 625-627
   * @returns {number} Float in [0, 1)
   */
  nextFloat() {
    return this.nextUint32() / 4294967296;
  }

  /**
   * Generate next pseudo-random byte [0, 255]
   * Matches backup/pixie-dust-original.html lines 628-630
   * @returns {number} Byte 0-255
   */
  nextByte() {
    return this.nextUint32() & 0xFF;
  }
}
