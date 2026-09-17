import { AssetType } from '../types';

/**
 * Generate realistic crypto addresses
 */
export function generateAddress(type: AssetType): string {
  const chars = '0123456789abcdef';
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  if (type === 'BTC') {
    // SegWit bc1q format
    let result = 'bc1q';
    for (let i = 0; i < 38; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  } else if (type === 'USDT_TRC20' || type === 'TRX') {
    // TRON address starting with T
    let result = 'T';
    for (let i = 0; i < 33; i++) {
      result += base58Chars.charAt(Math.floor(Math.random() * base58Chars.length));
    }
    return result;
  } else {
    // ETH format 0x...
    let result = '0x';
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Generate 64-character TXID
 */
export function generateTxid(): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate address format loosely for user experience
 */
export function validateAddress(address: string, assetType: AssetType): { isValid: boolean; message?: string } {
  if (!address || address.trim().length === 0) {
    return { isValid: false, message: 'Address cannot be empty / एड्रेस खाली नहीं हो सकता' };
  }
  const clean = address.trim();

  if (assetType === 'BTC') {
    if (clean.startsWith('bc1') || clean.startsWith('tb1') || clean.startsWith('1') || clean.startsWith('3') || clean.length >= 26) {
      return { isValid: true };
    }
    return { isValid: false, message: 'Invalid Bitcoin address format (Bitcoin address should start with bc1, 1, 3, or tb1)' };
  }

  if (assetType === 'USDT_TRC20' || assetType === 'TRX') {
    if (clean.startsWith('T') || clean.startsWith('t') || clean.length >= 20) {
      return { isValid: true };
    }
    return { isValid: false, message: 'Invalid TRON address (TRON TRC-20 address should start with T)' };
  }

  if (assetType === 'ETH') {
    if (clean.startsWith('0x') || clean.startsWith('0X') || clean.length >= 20) {
      return { isValid: true };
    }
    return { isValid: false, message: 'Invalid Ethereum address (ETH address should start with 0x)' };
  }

  return { isValid: true };
}

/**
 * Format string to truncated address/hash
 */
export function truncateHash(hash: string, start = 8, end = 8): string {
  if (!hash) return '';
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

/**
 * Calculate remaining validity in days, hours, minutes for 300-day cycle
 */
export function calculateRemainingTime(expiresAt: number, simulatedDaysOffset: number = 0): {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  percentageRemaining: number;
} {
  const now = Date.now() + (simulatedDaysOffset * 86400000);
  const diffMs = expiresAt - now;

  if (diffMs <= 0) {
    return {
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      percentageRemaining: 0
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // 300 days total in seconds = 300 * 86400
  const maxSeconds = 300 * 86400;
  const percentageRemaining = Math.max(0, Math.min(100, (totalSeconds / maxSeconds) * 100));

  return {
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    percentageRemaining
  };
}

/**
 * Web Audio sound feedback
 */
export function playAudioFeedback(type: 'click' | 'success' | 'broadcast' | 'expire' | 'error') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'broadcast') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'expire') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {
    // Ignore audio permission or context restrictions
  }
}

/**
 * Generate 12-word BIP-39 mnemonic seed phrase
 */
export function generateMnemonic(): string {
  const words = [
    'orbit', 'galaxy', 'quantum', 'matrix', 'nebula', 'cipher', 'crystal', 'rocket',
    'vector', 'echo', 'phantom', 'beacon', 'solstice', 'vortex', 'genesis', 'apex',
    'zenith', 'pulse', 'neutron', 'aurora', 'hyper', 'crypto', 'shadow', 'stellar',
    'binary', 'plasma', 'flux', 'horizon', 'prism', 'cosmos', 'titan', 'nexus'
  ];
  const selected: string[] = [];
  for (let i = 0; i < 12; i++) {
    const idx = Math.floor(Math.random() * words.length);
    selected.push(words[idx]);
  }
  return selected.join(' ');
}
