const UINT32_MAX = 0xffffffff;

export interface Rng {
  next(): number;
  nextInt(maxExclusive: number): number;
  clone(): Rng;
}

class Mulberry32 implements Rng {
  constructor(private state: number) {}

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / (UINT32_MAX + 1);
  }

  nextInt(maxExclusive: number): number {
    if (maxExclusive <= 0) {
      throw new Error("maxExclusive must be greater than zero");
    }
    return Math.floor(this.next() * maxExclusive);
  }

  clone(): Rng {
    return new Mulberry32(this.state);
  }
}

export function createRng(seed: number | string): Rng {
  return new Mulberry32(normalizeSeed(seed));
}

export function normalizeSeed(seed: number | string): number {
  if (typeof seed === "number" && Number.isFinite(seed)) {
    return seed >>> 0;
  }

  const text = String(seed);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}
