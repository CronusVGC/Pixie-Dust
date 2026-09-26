/**
 * PIXIE DUST - Coordinate Permutation Module
 * 
 * Source of truth: backup/pixie-dust-original.html (Lines 763-780, 880-895)
 * 
 * Rules:
 * - NO UI dependencies
 * - Uses Xoshiro128PRNG seeded with masterKey
 * - Fisher-Yates coordinate shuffle
 * - Optional onProgress callback for non-blocking UI reporting
 */

import { CRYPTO_CONFIG } from './cryptoConfig.js';
import { Xoshiro128PRNG } from './prng.js';

/**
 * Generate a deterministic Fisher-Yates permutation array for all pixel coordinates.
 * Matches backup/pixie-dust-original.html lines 763-780 and 880-895.
 * 
 * @param {number} totalPixels - Total number of pixels (width * height)
 * @param {Uint8Array} masterKey - 32-byte master key
 * @param {Function} [onProgress] - Optional async callback: onProgress(ratio: number)
 * @returns {Promise<Uint32Array>} Deterministic permutation index array
 */
export async function generatePermutation(totalPixels, masterKey, onProgress = null) {
  const prng = new Xoshiro128PRNG(masterKey);
  const perm = new Uint32Array(totalPixels);
  
  for (let i = 0; i < totalPixels; i++) {
    perm[i] = i;
  }

  const chunkSize = CRYPTO_CONFIG.CHUNK_SIZE;

  // Fisher-Yates shuffle
  for (let i = totalPixels - 1; i > 0; i--) {
    const j = Math.floor(prng.nextFloat() * (i + 1));
    const temp = perm[i];
    perm[i] = perm[j];
    perm[j] = temp;

    if (onProgress && i % chunkSize === 0) {
      const ratio = (totalPixels - i) / totalPixels;
      await onProgress(ratio);
    }
  }

  return perm;
}
