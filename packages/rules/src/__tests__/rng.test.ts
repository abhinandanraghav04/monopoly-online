import { describe, it, expect } from "vitest";
import { createRng, normalizeSeed } from "../rng";

describe("RNG", () => {
  describe("createRng", () => {
    it("should create an RNG from a numeric seed", () => {
      const rng = createRng(12345);
      expect(rng).toBeDefined();
      expect(typeof rng.next).toBe("function");
    });

    it("should create an RNG from a string seed", () => {
      const rng = createRng("test-seed");
      expect(rng).toBeDefined();
      expect(typeof rng.next).toBe("function");
    });

    it("should produce deterministic results for the same seed", () => {
      const rng1 = createRng(42);
      const rng2 = createRng(42);

      const values1 = Array.from({ length: 10 }, () => rng1.next());
      const values2 = Array.from({ length: 10 }, () => rng2.next());

      expect(values1).toEqual(values2);
    });

    it("should produce different results for different seeds", () => {
      const rng1 = createRng(42);
      const rng2 = createRng(43);

      const values1 = Array.from({ length: 10 }, () => rng1.next());
      const values2 = Array.from({ length: 10 }, () => rng2.next());

      expect(values1).not.toEqual(values2);
    });

    it("should produce values between 0 and 1", () => {
      const rng = createRng(12345);
      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });

  describe("normalizeSeed", () => {
    it("should normalize a number seed", () => {
      const seed = normalizeSeed(12345);
      expect(typeof seed).toBe("number");
      expect(seed).toBe(12345);
    });

    it("should normalize a string seed to a number", () => {
      const seed = normalizeSeed("test-seed");
      expect(typeof seed).toBe("number");
      expect(Number.isFinite(seed)).toBe(true);
    });

    it("should produce the same hash for the same string", () => {
      const seed1 = normalizeSeed("consistent");
      const seed2 = normalizeSeed("consistent");
      expect(seed1).toBe(seed2);
    });

    it("should produce different hashes for different strings", () => {
      const seed1 = normalizeSeed("one");
      const seed2 = normalizeSeed("two");
      expect(seed1).not.toBe(seed2);
    });
  });

  describe("nextInt", () => {
    it("should generate integers in the specified range", () => {
      const rng = createRng(42);
      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(6);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(6);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it("should throw for invalid ranges", () => {
      const rng = createRng(42);
      expect(() => rng.nextInt(0)).toThrow();
      expect(() => rng.nextInt(-5)).toThrow();
    });
  });

  describe("clone", () => {
    it("should produce identical sequences from a clone", () => {
      const rng1 = createRng(100);
      rng1.next();
      rng1.next();

      const rng2 = rng1.clone();

      const values1 = Array.from({ length: 5 }, () => rng1.next());
      const values2 = Array.from({ length: 5 }, () => rng2.next());

      expect(values1).toEqual(values2);
    });
  });
});
