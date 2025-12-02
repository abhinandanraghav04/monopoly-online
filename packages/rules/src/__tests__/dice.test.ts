import { describe, expect, it } from "vitest";
import { diceRoll } from "../dice";
import { createRng } from "../rng";

describe("diceRoll", () => {
  it("should return two dice and a total", () => {
    const rng = createRng(1);
    const roll = diceRoll(rng);
    expect(Array.isArray(roll.dice)).toBe(true);
    expect(roll.dice.length).toBe(2);
    expect(roll.total).toBe(roll.dice[0] + roll.dice[1]);
  });

  it("should produce deterministic results for a specific seed", () => {
    const rng1 = createRng(123);
    const rng2 = createRng(123);

    const roll1 = diceRoll(rng1);
    const roll2 = diceRoll(rng2);

    expect(roll1).toEqual(roll2);
  });

  it("should produce dice values between 1 and 6", () => {
    const rng = createRng(999);
    const iterations = 50;

    for (let i = 0; i < iterations; i++) {
      const { dice } = diceRoll(rng);
      for (const die of dice) {
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(6);
      }
    }
  });

  it("should mark isDouble when both dice are equal", () => {
    const rng = createRng(7);

    let foundDouble = false;
    for (let i = 0; i < 200 && !foundDouble; i++) {
      const result = diceRoll(rng);
      if (result.dice[0] === result.dice[1]) {
        expect(result.isDouble).toBe(true);
        foundDouble = true;
      }
    }

    expect(foundDouble).toBe(true);
  });
});
