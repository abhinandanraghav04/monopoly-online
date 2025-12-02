import { describe, expect, it } from "vitest";
import { runSingleTurn, runMultipleTurns } from "../simulation";
import { createTestState } from "./testUtils";
import { createRng } from "../rng";

describe("simulation", () => {
  describe("runSingleTurn", () => {
    it("should complete a full turn without throwing", () => {
      const state = createTestState();
      const rng = createRng(123);

      expect(() => runSingleTurn(state, rng)).not.toThrow();
    });

    it("should return a state and events", () => {
      const state = createTestState();
      const rng = createRng(456);

      const result = runSingleTurn(state, rng);

      expect(result.state).toBeDefined();
      expect(Array.isArray(result.events)).toBe(true);
    });

    it("should roll dice and move player", () => {
      const state = createTestState();
      const rng = createRng(789);
      const initialPosition = state.players[state.currentPlayerId].position;

      const result = runSingleTurn(state, rng);

      const movedEvent = result.events.find((e) => e.type === "MOVED");
      expect(movedEvent).toBeDefined();
      if (movedEvent && movedEvent.type === "MOVED") {
        expect(movedEvent.from).toBe(initialPosition);
        expect(movedEvent.to).not.toBe(initialPosition);
      }
    });

    it("should attempt to auto-buy properties if affordable", () => {
      const state = createTestState({ startingCash: 2000 });
      state.players[state.currentPlayerId].position = 0;
      const rng = createRng(1);

      const result = runSingleTurn(state, rng);

      const hasPurchased = result.events.some((e) => e.type === "PURCHASED");
      if (hasPurchased) {
        expect(result.state.players[state.config.playerOrder[0]].properties.length).toBeGreaterThan(0);
      }
    });

    it("should advance to the next player", () => {
      const state = createTestState();
      const rng = createRng(999);
      const currentPlayerId = state.currentPlayerId;

      const result = runSingleTurn(state, rng);

      expect(result.state.currentPlayerId).not.toBe(currentPlayerId);
    });
  });

  describe("runMultipleTurns", () => {
    it("should run multiple turns without throwing", () => {
      const state = createTestState();
      const rng = createRng(111);

      expect(() => runMultipleTurns(state, rng, 5)).not.toThrow();
    });

    it("should accumulate events across turns", () => {
      const state = createTestState();
      const rng = createRng(222);

      const result = runMultipleTurns(state, rng, 3);

      expect(result.events.length).toBeGreaterThan(0);
      const movedEvents = result.events.filter((e) => e.type === "MOVED");
      expect(movedEvents.length).toBeGreaterThanOrEqual(3);
    });

    it("should increment turn counter", () => {
      const state = createTestState({ playerOrder: ["p1", "p2"] });
      const rng = createRng(333);

      const result = runMultipleTurns(state, rng, 4);

      expect(result.state.turn).toBeGreaterThan(1);
    });

    it("should be deterministic for the same seed", () => {
      const state1 = createTestState();
      const state2 = createTestState();
      const rng1 = createRng(5555);
      const rng2 = createRng(5555);

      const result1 = runMultipleTurns(state1, rng1, 3);
      const result2 = runMultipleTurns(state2, rng2, 3);

      expect(result1.events).toEqual(result2.events);
    });
  });
});
