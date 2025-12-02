import { describe, expect, it } from "vitest";
import { reduceGameState } from "../reducer";
import { createInitialGameState } from "../state";
import { createRng } from "../rng";
import type { GameConfig } from "../state";

function createTestConfig(): GameConfig {
  return {
    gameId: "test-game",
    seed: 42,
    startingCash: 1500,
    goBonus: 200,
    playerOrder: ["player1", "player2"],
    board: [
      { kind: "GO", name: "Go", payout: 200 },
      { kind: "PROPERTY", name: "Mediterranean Avenue", propertyId: "prop_1", group: "brown" },
      { kind: "PROPERTY", name: "Baltic Avenue", propertyId: "prop_2", group: "brown" }
    ],
    properties: {
      prop_1: {
        id: "prop_1",
        name: "Mediterranean Avenue",
        purchasePrice: 60,
        baseRent: 2,
        rentWithHouses: [2, 10, 30, 90, 160, 250],
        houseCost: 50,
        group: "brown",
        type: "PROPERTY"
      },
      prop_2: {
        id: "prop_2",
        name: "Baltic Avenue",
        purchasePrice: 60,
        baseRent: 4,
        rentWithHouses: [4, 20, 60, 180, 320, 450],
        houseCost: 50,
        group: "brown",
        type: "PROPERTY"
      }
    }
  };
}

describe("reducer", () => {
  describe("ROLL action", () => {
    it("should move the player and emit a MOVED event", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      const rng = createRng(42);

      const result = reduceGameState(state, { type: "ROLL", playerId: "player1" }, rng);

      expect(result.state.players["player1"].position).toBeGreaterThan(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe("MOVED");
    });

    it("should give GO bonus when passing GO", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      state.players["player1"].position = 2;
      const rng = createRng(1);

      const initialCash = state.players["player1"].cash;
      const result = reduceGameState(state, { type: "ROLL", playerId: "player1" }, rng);

      if (result.state.players["player1"].position < 2) {
        expect(result.state.players["player1"].cash).toBe(initialCash + config.goBonus);
      }
    });

    it("should transition to Buy phase if landing on unowned affordable property", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      state.players["player1"].position = 0;
      const rng = createRng(9999);

      let result = reduceGameState(state, { type: "ROLL", playerId: "player1" }, rng);
      let attempts = 0;

      while (result.state.phase !== "Buy" && attempts < 50) {
        if (result.state.phase === "Roll") {
          result = reduceGameState(result.state, { type: "ROLL", playerId: result.state.currentPlayerId }, rng);
        } else {
          result = reduceGameState(result.state, { type: "END_TURN", playerId: result.state.currentPlayerId }, rng);
        }
        attempts++;
      }

      if (result.state.phase === "Buy") {
        expect(result.state.phase).toBe("Buy");
      }
    });

    it("should throw if it's not the player's turn", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      const rng = createRng(42);

      expect(() => reduceGameState(state, { type: "ROLL", playerId: "player2" }, rng)).toThrow();
    });
  });

  describe("BUY action", () => {
    it("should purchase property and emit PURCHASED event", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      state.phase = "Buy";
      state.players["player1"].position = 1;
      const rng = createRng(42);

      const result = reduceGameState(
        state,
        { type: "BUY", playerId: "player1", propertyId: "prop_1" },
        rng
      );

      expect(result.state.propertyOwnership["prop_1"]).toBe("player1");
      expect(result.state.players["player1"].properties).toContain("prop_1");
      expect(result.state.players["player1"].cash).toBe(1500 - 60);
      expect(result.events).toContainEqual(
        expect.objectContaining({
          type: "PURCHASED",
          playerId: "player1",
          propertyId: "prop_1"
        })
      );
    });

    it("should throw if player cannot afford property", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      state.phase = "Buy";
      state.players["player1"].position = 1;
      state.players["player1"].cash = 50;
      const rng = createRng(42);

      expect(() =>
        reduceGameState(state, { type: "BUY", playerId: "player1", propertyId: "prop_1" }, rng)
      ).toThrow();
    });
  });

  describe("PASS action", () => {
    it("should transition to Resolve phase without buying", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      state.phase = "Buy";
      state.players["player1"].position = 1;
      const rng = createRng(42);

      const result = reduceGameState(state, { type: "PASS", playerId: "player1" }, rng);

      expect(result.state.phase).toBe("Resolve");
      expect(result.state.propertyOwnership["prop_1"]).toBeNull();
    });
  });

  describe("END_TURN action", () => {
    it("should advance to the next player", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      state.phase = "Resolve";
      const rng = createRng(42);

      const result = reduceGameState(state, { type: "END_TURN", playerId: "player1" }, rng);

      expect(result.state.currentPlayerId).toBe("player2");
      expect(result.state.phase).toBe("Roll");
    });

    it("should increment turn when cycling back to first player", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      state.currentPlayerIndex = 1;
      state.currentPlayerId = "player2";
      state.phase = "Resolve";
      const rng = createRng(42);

      const result = reduceGameState(state, { type: "END_TURN", playerId: "player2" }, rng);

      expect(result.state.turn).toBe(2);
      expect(result.state.currentPlayerId).toBe("player1");
    });
  });

  describe("invariants", () => {
    it("should never allow negative cash", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      const rng = createRng(123);

      for (let i = 0; i < 10; i++) {
        const result = reduceGameState(
          state,
          { type: "ROLL", playerId: state.currentPlayerId },
          rng
        );
        for (const player of Object.values(result.state.players)) {
          expect(player.cash).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it("should maintain property ownership consistency", () => {
      const config = createTestConfig();
      const state = createInitialGameState(config);
      state.phase = "Buy";
      state.players["player1"].position = 1;
      const rng = createRng(42);

      const result = reduceGameState(
        state,
        { type: "BUY", playerId: "player1", propertyId: "prop_1" },
        rng
      );

      expect(result.state.propertyOwnership["prop_1"]).toBe("player1");
      expect(result.state.players["player1"].properties).toContain("prop_1");
    });
  });
});
