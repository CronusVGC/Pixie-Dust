/**
 * PIXIE DUST - Password & Key Utilities
 * 
 * Provides entropy calculation and key generation.
 * Preserves backup/pixie-dust-original.html lines 476-511 logic.
 */

/**
 * Calculates passphrase entropy score (0 to 100) and strength level.
 * @param {string} password 
 * @returns {{ score: number, label: string, colorClass: string }}
 */
export function evaluatePasswordStrength(password) {
  if (!password || password.length === 0) {
    return { score: 0, label: 'Empty', colorClass: 'bg-slate-600 text-slate-400' };
  }

  let score = 0;
  if (password.length >= 4) score += 25;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  if (score <= 25) {
    return { score, label: 'Basic', colorClass: 'bg-rose-500 text-rose-400' };
  } else if (score <= 50) {
    return { score, label: 'Medium', colorClass: 'bg-amber-500 text-amber-400' };
  } else if (score <= 75) {
    return { score, label: 'Strong', colorClass: 'bg-cyan-400 text-cyan-400' };
  } else {
    return { score: 100, label: 'Maximum', colorClass: 'bg-emerald-400 text-emerald-400' };
  }
}

/**
 * Generates a random secure memorable passphrase or alphanumeric token.
 * @returns {string} Generated passphrase
 */
export function generateRandomPassphrase() {
  const words = [
    'pixie', 'cipher', 'quantum', 'shield', 'stealth', 'nebula', 
    'aurora', 'matrix', 'crystal', 'beacon', 'prism', 'zenith',
    'shadow', 'glitch', 'vector', 'orbital', 'cosmic', 'plasma'
  ];
  const w1 = words[Math.floor(Math.random() * words.length)];
  const w2 = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${w1}-${w2}-${num}`;
}
