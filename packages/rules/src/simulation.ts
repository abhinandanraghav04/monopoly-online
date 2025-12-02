import type { Rng } from "./rng";
import type { GameState } from "./state";
import { reduceGameState } from "./reducer";
import type { GameEvent } from "./events";
import { ownableTilePropertyId, getTileForPlayer, isPropertyAvailable, getPropertyById } from "./state";

export interface SimulationResult {
  state: GameState;
  events: GameEvent[];
}

export function runSingleTurn(state: GameState, rng: Rng): SimulationResult {
  let currentState = state;
  const allEvents: GameEvent[] = [];

  if (currentState.phase === "Roll") {
    const rollResult = reduceGameState(
      currentState,
      { type: "ROLL", playerId: currentState.currentPlayerId },
      rng
    );
    currentState = rollResult.state;
    allEvents.push(...rollResult.events);
  }

  if (currentState.phase === "Buy") {
    const player = currentState.players[currentState.currentPlayerId];
    const tile = getTileForPlayer(currentState, currentState.currentPlayerId);
    const propertyId = ownableTilePropertyId(tile);

    let action:
      | { type: "BUY"; playerId: string; propertyId: string }
      | { type: "PASS"; playerId: string };

    if (propertyId && isPropertyAvailable(currentState, propertyId)) {
      const property = getPropertyById(currentState, propertyId);
      action =
        player.cash >= property.purchasePrice
          ? { type: "BUY", playerId: currentState.currentPlayerId, propertyId }
          : { type: "PASS", playerId: currentState.currentPlayerId };
    } else {
      action = { type: "PASS", playerId: currentState.currentPlayerId };
    }

    const result = reduceGameState(currentState, action, rng);
    currentState = result.state;
    allEvents.push(...result.events);
  }

  if (currentState.phase === "Resolve" || currentState.phase === "EndTurn") {
    const endTurnResult = reduceGameState(
      currentState,
      { type: "END_TURN", playerId: currentState.currentPlayerId },
      rng
    );
    currentState = endTurnResult.state;
    allEvents.push(...endTurnResult.events);
  }

  return {
    state: currentState,
    events: allEvents
  };
}

export function runMultipleTurns(
  initialState: GameState,
  rng: Rng,
  turnCount: number
): SimulationResult {
  let currentState = initialState;
  const allEvents: GameEvent[] = [];

  for (let i = 0; i < turnCount; i++) {
    const result = runSingleTurn(currentState, rng);
    currentState = result.state;
    allEvents.push(...result.events);
  }

  return {
    state: currentState,
    events: allEvents
  };
}
