/**
 * PIXIE DUST - Demo Payload Generator
 * 
 * Recreates the authentic "Doom Secret Payload" classified test image
 * from backup/pixie-dust-original.html lines 1012-1065.
 */

/**
 * Creates the sample secret image payload in memory.
 * @returns {{ imageData: ImageData, width: number, height: number, dataUrl: string, defaultPassword: string }}
 */
export function createDemoPayloadImage() {
  const width = 500;
  const height = 350;
  const demoCanvas = document.createElement('canvas');
  demoCanvas.width = width;
  demoCanvas.height = height;
  const ctx = demoCanvas.getContext('2d', { willReadFrequently: true });

  // Background
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, width, height);

  // Radial Cyber Shield Gradient
  const grad = ctx.createRadialGradient(250, 175, 20, 250, 175, 220);
  grad.addColorStop(0, '#06b6d4');
  grad.addColorStop(0.5, '#10b981');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(250, 175, 130, 0, Math.PI * 2);
  ctx.fill();

  // Primary Payload Text
  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('SECRET PAYLOAD', 250, 170);

  // Subtitle
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#a5f3fc';
  ctx.fillText('CLASSIFIED TEST IMAGE', 250, 195);

  const dataUrl = demoCanvas.toDataURL('image/png');
  const imageData = ctx.getImageData(0, 0, width, height);

  return {
    imageData,
    width,
    height,
    dataUrl,
    defaultPassword: 'loser',
    fileName: 'Doom_Secret_Payload.png'
  };
}
