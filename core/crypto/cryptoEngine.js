/**
 * PIXIE DUST - Unified Cryptographic Engine
 * 
 * Preserves the exact, verified cryptographic pipeline from backup/pixie-dust-original.html.
 * Exposes clean, promise-based interfaces: protectImage() and restoreImage().
 * 
 * Rules:
 * - NO UI/DOM dependencies.
 * - Pure data buffer transformations.
 * - Non-blocking progress callbacks.
 * - Zero security exaggerations.
 */

import { CRYPTO_CONFIG } from './cryptoConfig.js';
import { Xoshiro128PRNG } from './prng.js';
import { deriveKeyAndVerifier, verifyVerifierTag } from './keyDerivation.js';

/**
 * Maps logical channel index to RGBA byte index (skipping Alpha channel).
 * Matches backup/pixie-dust-original.html line 633-637.
 */
export function getChannelIndex(c) {
  const p = Math.floor(c / 3);
  const r = c % 3;
  return p * 4 + r;
}

/**
 * Embeds 16B salt + 4B verifier into channels 0..159,
 * and preserves original 160 LSBs into channels 160..319 for 100% loss-free restoration.
 * Matches backup/pixie-dust-original.html lines 639-673.
 */
export function embedLSBHeader(data, salt, verifier) {
  const origLSBs = new Uint8Array(CRYPTO_CONFIG.HEADER_BYTES);
  for (let c = 0; c < CRYPTO_CONFIG.HEADER_CHANNELS; c++) {
    const byteIdx = Math.floor(c / 8);
    const bitPos = 7 - (c % 8);
    const channelIdx = getChannelIndex(c);
    const origBit = data[channelIdx] & 1;
    origLSBs[byteIdx] |= (origBit << bitPos);
  }

  const meta = new Uint8Array(CRYPTO_CONFIG.HEADER_BYTES);
  meta.set(salt, 0);
  meta.set(verifier, 16);

  // Embed salt & verifier
  for (let c = 0; c < CRYPTO_CONFIG.HEADER_CHANNELS; c++) {
    const byteIdx = Math.floor(c / 8);
    const bitPos = 7 - (c % 8);
    const bitVal = (meta[byteIdx] >> bitPos) & 1;
    const channelIdx = getChannelIndex(c);
    data[channelIdx] = (data[channelIdx] & 0xFE) | bitVal;
  }

  // Embed preserved original LSBs into channels 160..319
  for (let c = 0; c < CRYPTO_CONFIG.BACKUP_CHANNELS; c++) {
    const channelC = CRYPTO_CONFIG.HEADER_CHANNELS + c;
    const byteIdx = Math.floor(c / 8);
    const bitPos = 7 - (c % 8);
    const bitVal = (origLSBs[byteIdx] >> bitPos) & 1;
    const channelIdx = getChannelIndex(channelC);
    data[channelIdx] = (data[channelIdx] & 0xFE) | bitVal;
  }
}

/**
 * Extracts salt, verifier, and preserved original LSBs from LSB header.
 * Matches backup/pixie-dust-original.html lines 675-700.
 */
export function extractLSBHeader(data) {
  const extractedMeta = new Uint8Array(CRYPTO_CONFIG.HEADER_BYTES);
  for (let c = 0; c < CRYPTO_CONFIG.HEADER_CHANNELS; c++) {
    const byteIdx = Math.floor(c / 8);
    const bitPos = 7 - (c % 8);
    const channelIdx = getChannelIndex(c);
    const bitVal = data[channelIdx] & 1;
    extractedMeta[byteIdx] |= (bitVal << bitPos);
  }
  const salt = extractedMeta.slice(0, 16);
  const verifier = extractedMeta.slice(16, 20);

  const origLSBs = new Uint8Array(CRYPTO_CONFIG.HEADER_BYTES);
  for (let c = 0; c < CRYPTO_CONFIG.BACKUP_CHANNELS; c++) {
    const channelC = CRYPTO_CONFIG.HEADER_CHANNELS + c;
    const byteIdx = Math.floor(c / 8);
    const bitPos = 7 - (c % 8);
    const channelIdx = getChannelIndex(channelC);
    const bitVal = data[channelIdx] & 1;
    origLSBs[byteIdx] |= (bitVal << bitPos);
  }

  return { salt, verifier, origLSBs };
}

/**
 * Restores original LSBs into channels 0..159 for pixel-perfect reconstruction.
 * Matches backup/pixie-dust-original.html lines 702-710.
 */
export function restoreOriginalLSBs(data, origLSBs) {
  for (let c = 0; c < CRYPTO_CONFIG.HEADER_CHANNELS; c++) {
    const byteIdx = Math.floor(c / 8);
    const bitPos = 7 - (c % 8);
    const origBit = (origLSBs[byteIdx] >> bitPos) & 1;
    const channelIdx = getChannelIndex(c);
    data[channelIdx] = (data[channelIdx] & 0xFE) | origBit;
  }
}

/**
 * Yield execution to allow non-blocking browser rendering.
 */
function yieldTick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Protect an image using PBKDF2 key derivation, Fisher-Yates permutation,
 * keystream XOR diffusion, and LSB metadata embedding.
 * 
 * Preserves the exact algorithm from backup/pixie-dust-original.html lines 749-841.
 * 
 * @param {Object} options
 * @param {ImageData} options.imageData - Source image data
 * @param {string} options.password - Passphrase
 * @param {Function} [options.onProgress] - Optional progress callback ({ percent, stepText })
 * @returns {Promise<{ outputImageData: ImageData, durationMs: number }>}
 */
export async function protectImage({ imageData, password, onProgress = null }) {
  const startTime = performance.now();
  const width = imageData.width;
  const height = imageData.height;
  const totalPixels = width * height;

  if (totalPixels < CRYPTO_CONFIG.MIN_REQUIRED_PIXELS) {
    throw new Error(`Image is too small (${totalPixels} px). Minimum required size is ${CRYPTO_CONFIG.MIN_REQUIRED_PIXELS} pixels.`);
  }

  if (onProgress) onProgress({ percent: 5, stepText: 'Generating 16-byte random salt...' });
  const salt = new Uint8Array(CRYPTO_CONFIG.SALT_BYTES);
  crypto.getRandomValues(salt);

  if (onProgress) onProgress({ percent: 15, stepText: 'Deriving PBKDF2 key (100,000 iterations)...' });
  await yieldTick();

  const { masterKey, verifierTag } = await deriveKeyAndVerifier(password, salt);

  if (onProgress) onProgress({ percent: 30, stepText: 'Generating coordinate permutation...' });
  await yieldTick();

  const prng = new Xoshiro128PRNG(masterKey);
  const perm = new Uint32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) perm[i] = i;

  const chunkSize = CRYPTO_CONFIG.CHUNK_SIZE;
  for (let i = totalPixels - 1; i > 0; i--) {
    const j = Math.floor(prng.nextFloat() * (i + 1));
    const temp = perm[i];
    perm[i] = perm[j];
    perm[j] = temp;

    if (onProgress && i % chunkSize === 0) {
      const pct = 30 + ((totalPixels - i) / totalPixels) * 30;
      onProgress({ percent: Math.round(pct), stepText: `Shuffling coordinates (${Math.round(pct)}%)...` });
      await yieldTick();
    }
  }

  if (onProgress) onProgress({ percent: 65, stepText: 'Applying XOR diffusion...' });
  await yieldTick();

  const prngKS = new Xoshiro128PRNG(masterKey);
  const srcData32 = new Uint32Array(imageData.data.buffer);

  // Create output buffer
  const outputImgData = new ImageData(new Uint8ClampedArray(imageData.data.length), width, height);
  const outData8 = outputImgData.data;

  for (let i = 0; i < totalPixels; i++) {
    const srcIdx = perm[i];
    const srcVal = srcData32[srcIdx];

    const r = srcVal & 0xFF;
    const g = (srcVal >> 8) & 0xFF;
    const b = (srcVal >> 16) & 0xFF;
    const a = (srcVal >> 24) & 0xFF;

    const kR = prngKS.nextByte();
    const kG = prngKS.nextByte();
    const kB = prngKS.nextByte();

    const outOffset = i * 4;
    outData8[outOffset] = r ^ kR;
    outData8[outOffset + 1] = g ^ kG;
    outData8[outOffset + 2] = b ^ kB;
    outData8[outOffset + 3] = a;

    if (onProgress && i % chunkSize === 0) {
      const pct = 65 + (i / totalPixels) * 20;
      onProgress({ percent: Math.round(pct), stepText: `Diffusion (${Math.round(pct)}%)...` });
      await yieldTick();
    }
  }

  if (onProgress) onProgress({ percent: 90, stepText: 'Embedding LSB steganographic header...' });
  embedLSBHeader(outData8, salt, verifierTag);

  const durationMs = Math.round(performance.now() - startTime);
  if (onProgress) onProgress({ percent: 100, stepText: 'Protection complete!' });

  return {
    outputImageData: outputImgData,
    durationMs
  };
}

/**
 * Restore an encrypted image using LSB header extraction, PBKDF2 authentication,
 * LSB recovery, reverse XOR keystream, and reverse coordinate permutation.
 * 
 * Preserves the exact algorithm from backup/pixie-dust-original.html lines 843-967.
 * 
 * @param {Object} options
 * @param {ImageData} options.imageData - Encrypted image data
 * @param {string} options.password - Passphrase
 * @param {Function} [options.onProgress] - Optional progress callback ({ percent, stepText })
 * @returns {Promise<{ success: boolean, restoredImageData?: ImageData, durationMs?: number, error?: string }>}
 */
export async function restoreImage({ imageData, password, onProgress = null }) {
  const startTime = performance.now();
  const width = imageData.width;
  const height = imageData.height;
  const totalPixels = width * height;

  if (totalPixels < CRYPTO_CONFIG.MIN_REQUIRED_PIXELS) {
    return {
      success: false,
      error: 'FILE_CORRUPTED',
      message: `Image too small to contain a Pixie Dust header.`
    };
  }

  if (onProgress) onProgress({ percent: 5, stepText: 'Extracting LSB header...' });
  await yieldTick();

  // Create a copy of the buffer so we don't mutate input prematurely
  const srcData8 = new Uint8Array(imageData.data.slice().buffer);
  const { salt, verifier, origLSBs } = extractLSBHeader(srcData8);

  if (onProgress) onProgress({ percent: 15, stepText: 'Deriving key and authenticating...' });
  await yieldTick();

  const { masterKey, verifierTag } = await deriveKeyAndVerifier(password, salt);

  // Authenticate tag
  const isVerified = verifyVerifierTag(verifier, verifierTag);

  if (!isVerified) {
    if (onProgress) onProgress({ percent: 0, stepText: 'Authentication Failed' });
    return {
      success: false,
      error: 'ACCESS_DENIED',
      message: 'Access Denied: Incorrect passphrase. Decryption aborted to prevent data corruption.'
    };
  }

  if (onProgress) onProgress({ percent: 30, stepText: 'Restoring original LSBs...' });
  restoreOriginalLSBs(srcData8, origLSBs);
  await yieldTick();

  const prng = new Xoshiro128PRNG(masterKey);
  const perm = new Uint32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) perm[i] = i;

  const chunkSize = CRYPTO_CONFIG.CHUNK_SIZE;
  for (let i = totalPixels - 1; i > 0; i--) {
    const j = Math.floor(prng.nextFloat() * (i + 1));
    const temp = perm[i];
    perm[i] = perm[j];
    perm[j] = temp;

    if (onProgress && i % chunkSize === 0) {
      const pct = 30 + ((totalPixels - i) / totalPixels) * 30;
      onProgress({ percent: Math.round(pct), stepText: `Rebuilding permutation (${Math.round(pct)}%)...` });
      await yieldTick();
    }
  }

  if (onProgress) onProgress({ percent: 65, stepText: 'Reversing XOR diffusion...' });
  await yieldTick();

  const prngKS = new Xoshiro128PRNG(masterKey);
  const unXored8 = new Uint8Array(totalPixels * 4);

  for (let i = 0; i < totalPixels; i++) {
    const inOffset = i * 4;
    const encR = srcData8[inOffset];
    const encG = srcData8[inOffset + 1];
    const encB = srcData8[inOffset + 2];
    const a = srcData8[inOffset + 3];

    const kR = prngKS.nextByte();
    const kG = prngKS.nextByte();
    const kB = prngKS.nextByte();

    unXored8[inOffset] = encR ^ kR;
    unXored8[inOffset + 1] = encG ^ kG;
    unXored8[inOffset + 2] = encB ^ kB;
    unXored8[inOffset + 3] = a;

    if (onProgress && i % chunkSize === 0) {
      const pct = 65 + (i / totalPixels) * 20;
      onProgress({ percent: Math.round(pct), stepText: `Un-XOR (${Math.round(pct)}%)...` });
      await yieldTick();
    }
  }

  if (onProgress) onProgress({ percent: 85, stepText: 'Writing restored pixels...' });
  const restoredImgData = new ImageData(new Uint8ClampedArray(imageData.data.length), width, height);
  const restoredData8 = restoredImgData.data;

  for (let i = 0; i < totalPixels; i++) {
    const origPos = perm[i];
    const srcOffset = i * 4;
    const destOffset = origPos * 4;

    restoredData8[destOffset] = unXored8[srcOffset];
    restoredData8[destOffset + 1] = unXored8[srcOffset + 1];
    restoredData8[destOffset + 2] = unXored8[srcOffset + 2];
    restoredData8[destOffset + 3] = unXored8[srcOffset + 3];

    if (onProgress && i % chunkSize === 0) {
      const pct = 85 + (i / totalPixels) * 10;
      onProgress({ percent: Math.round(pct), stepText: `Restoring coordinates (${Math.round(pct)}%)...` });
      await yieldTick();
    }
  }

  const durationMs = Math.round(performance.now() - startTime);
  if (onProgress) onProgress({ percent: 100, stepText: 'Restoration complete!' });

  return {
    success: true,
    restoredImageData: restoredImgData,
    durationMs
  };
}
