import { describe, expect, it } from "vitest";
import { runMultipleTurns } from "../simulation";
import { createTestState } from "./testUtils";
import type { Rng } from "../rng";

class FixedRng implements Rng {
  private index = 0;

  constructor(private readonly values: number[]) {}

  next(): number {
    return (this.nextInt(1_000_000) + 0.5) / 1_000_000;
  }

  nextInt(maxExclusive: number): number {
    if (maxExclusive <= 0) {
      throw new Error("maxExclusive must be greater than zero");
    }
    const value = this.values[this.index];
    if (value === undefined) {
      throw new Error("FixedRng: ran out of values");
    }
    this.index += 1;
    return value % maxExclusive;
  }

  clone(): Rng {
    const clone = new FixedRng(this.values.slice(this.index));
    return clone;
  }
}

describe("event sequences", () => {
  it("snapshots a short deterministic game", () => {
    const state = createTestState();
    const rng = new FixedRng([0, 0, 1, 1, 2, 2, 3, 3]);

    const result = runMultipleTurns(state, rng, 2);

    expect(result.events).toMatchInlineSnapshot(`
      [
        {
          "dice": {
            "dice": [
              1,
              1,
            ],
            "isDouble": true,
            "total": 2,
          },
          "from": 0,
          "playerId": "player1",
          "to": 2,
          "type": "MOVED",
        },
        {
          "playerId": "player1",
          "price": 60,
          "propertyId": "prop_2",
          "type": "PURCHASED",
        },
        {
          "dice": {
            "dice": [
              2,
              2,
            ],
            "isDouble": true,
            "total": 4,
          },
          "from": 0,
          "playerId": "player2",
          "to": 0,
          "type": "MOVED",
        },
      ]
    `);
  });

  it("snapshots rent collection", () => {
    const state = createTestState();
    state.propertyOwnership["prop_2"] = "player2";
    state.players["player2"].properties.push("prop_2");
    const rng = new FixedRng([0, 0, 1, 1]);

    const result = runMultipleTurns(state, rng, 2);

    expect(result.events).toMatchInlineSnapshot(`
      [
        {
          "dice": {
            "dice": [
              1,
              1,
            ],
            "isDouble": true,
            "total": 2,
          },
          "from": 0,
          "playerId": "player1",
          "to": 2,
          "type": "MOVED",
        },
        {
          "amount": 4,
          "payerId": "player1",
          "propertyId": "prop_2",
          "recipientId": "player2",
          "type": "RENT_PAID",
        },
        {
          "dice": {
            "dice": [
              2,
              2,
            ],
            "isDouble": true,
            "total": 4,
          },
          "from": 0,
          "playerId": "player2",
          "to": 0,
          "type": "MOVED",
        },
      ]
    `);
  });
});
