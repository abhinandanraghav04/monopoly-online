import type { Rng } from "./rng";

export interface DiceRollResult {
  dice: [number, number];
  total: number;
  isDouble: boolean;
}

export function diceRoll(rng: Rng): DiceRollResult {
  const d1 = rng.nextInt(6) + 1;
  const d2 = rng.nextInt(6) + 1;
  const total = d1 + d2;
  return {
    dice: [d1, d2],
    total,
    isDouble: d1 === d2
  };
}
