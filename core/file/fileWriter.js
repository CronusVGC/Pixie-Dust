/**
 * PIXIE DUST - File Writer Module
 * 
 * Safely exports ImageData to lossless PNG format.
 * PNG is strictly required to preserve the LSB steganographic header.
 */

/**
 * Converts ImageData to a PNG DataURL.
 * @param {ImageData} imageData 
 * @returns {string} PNG DataURL
 */
export function imageDataToPngDataUrl(imageData) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Converts ImageData to a PNG Blob.
 * @param {ImageData} imageData 
 * @returns {Promise<Blob>}
 */
export function imageDataToPngBlob(imageData) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/**
 * Triggers a browser download of the given ImageData as a lossless PNG.
 * @param {ImageData} imageData 
 * @param {string} filename 
 */
export function downloadImageDataAsPng(imageData, filename = 'pixie-dust-protected.png') {
  const dataUrl = imageDataToPngDataUrl(imageData);
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
