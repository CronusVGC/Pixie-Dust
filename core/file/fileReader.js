/**
 * PIXIE DUST - File Reader Module
 * 
 * Safely loads image files into HTML5 Canvas and extracts ImageData.
 */

import { CRYPTO_CONFIG } from '../crypto/cryptoConfig.js';

/**
 * Reads an image file (PNG, JPG, WebP) and returns its ImageData along with metadata.
 * 
 * @param {File} file - User-selected image file
 * @returns {Promise<{ imageData: ImageData, width: number, height: number, fileName: string, fileSize: number, dataUrl: string }>}
 */
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not a supported image.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const totalPixels = width * height;

        if (totalPixels < CRYPTO_CONFIG.MIN_REQUIRED_PIXELS) {
          return reject(new Error(`Image is too small (${width}x${height} = ${totalPixels}px). Minimum required is ${CRYPTO_CONFIG.MIN_REQUIRED_PIXELS} pixels.`));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, width, height);

        resolve({
          imageData,
          width,
          height,
          fileName: file.name,
          fileSize: file.size,
          dataUrl
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
