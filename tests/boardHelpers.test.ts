import { describe, it, expect } from 'vitest';

import {
  CLASSIC_8x8,
  nextIndex,
  isCorner,
} from '../packages/rules/src/index';

describe('Board helpers', () => {
  describe('nextIndex', () => {
    it('handles step = 0', () => {
      expect(nextIndex(CLASSIC_8x8, 0, 0)).toBe(0);
      expect(nextIndex(CLASSIC_8x8, 10, 0)).toBe(10);
      expect(nextIndex(CLASSIC_8x8, 31, 0)).toBe(31);
    });

    it('handles step = 1', () => {
      expect(nextIndex(CLASSIC_8x8, 0, 1)).toBe(1);
      expect(nextIndex(CLASSIC_8x8, 5, 1)).toBe(6);
    });

    it('wraps from last tile to start', () => {
      const lastIndex = CLASSIC_8x8.config.tileCount - 1;
      expect(nextIndex(CLASSIC_8x8, lastIndex, 1)).toBe(0);
      expect(nextIndex(CLASSIC_8x8, lastIndex, 2)).toBe(1);
      expect(nextIndex(CLASSIC_8x8, lastIndex - 1, 3)).toBe(1);
    });

    it('handles large steps', () => {
      const tileCount = CLASSIC_8x8.config.tileCount;
      expect(nextIndex(CLASSIC_8x8, 10, tileCount)).toBe(10);
      expect(nextIndex(CLASSIC_8x8, 10, tileCount + 2)).toBe(12);
      expect(nextIndex(CLASSIC_8x8, 28, 10)).toBe(6);
    });

    it('handles negative-like wrap (large steps from end)', () => {
      const tileCount = CLASSIC_8x8.config.tileCount;
      expect(nextIndex(CLASSIC_8x8, 5, tileCount - 5)).toBe(0);
      expect(nextIndex(CLASSIC_8x8, 0, tileCount)).toBe(0);
    });
  });

  describe('isCorner', () => {
    it('identifies corners in CLASSIC_8x8', () => {
      const corners = CLASSIC_8x8.config.cornerIndexes;
      expect(corners).toHaveLength(4);

      corners.forEach((c) => {
        expect(isCorner(CLASSIC_8x8, c)).toBe(true);
      });

      const nonCorners = [1, 2, 5, 7, 9, 11, 15];
      nonCorners.forEach((c) => {
        expect(isCorner(CLASSIC_8x8, c)).toBe(false);
      });
    });

    it('handles first tile correctly (GO tile)', () => {
      expect(isCorner(CLASSIC_8x8, CLASSIC_8x8.config.startTileIndex)).toBe(true);
    });

    it('corners are evenly spaced', () => {
      const { cornerIndexes, sideLength } = CLASSIC_8x8.config;
      for (let i = 0; i < cornerIndexes.length - 1; i += 1) {
        const spacing = cornerIndexes[i + 1] - cornerIndexes[i];
        expect(spacing).toBe(sideLength);
      }
    });
  });
});
