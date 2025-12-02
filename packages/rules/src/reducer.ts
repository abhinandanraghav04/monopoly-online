import type { GameAction } from "./actions";
import type { GameEvent } from "./events";
import { diceRoll } from "./dice";
import type { Rng } from "./rng";
import {
  GameState,
  cloneGameState,
  getPropertyById,
  getTileForPlayer,
  isPropertyAvailable,
  ownableTilePropertyId
} from "./state";
import type { Property } from "./entities";

export interface ReducerResult {
  state: GameState;
  events: GameEvent[];
}

export function reduceGameState(
  state: GameState,
  action: GameAction,
  rng: Rng
): ReducerResult {
  const nextState = cloneGameState(state);
  const events: GameEvent[] = [];

  switch (action.type) {
    case "ROLL": {
      validateTurn(nextState, action.playerId, "Roll");

      const roll = diceRoll(rng);
      nextState.diceHistory.push(roll);

      const player = nextState.players[action.playerId];
      const from = player.position;
      const boardSize = nextState.config.board.length;
      const rawDestination = from + roll.total;
      const passedGo = Math.floor(rawDestination / boardSize) > 0;
      player.position = rawDestination % boardSize;

      if (passedGo) {
        player.cash += nextState.config.goBonus;
      }

      events.push({
        type: "MOVED",
        playerId: action.playerId,
        from,
        to: player.position,
        dice: roll
      });

      const tile = getTileForPlayer(nextState, action.playerId);
      const propertyId = ownableTilePropertyId(tile);

      if (propertyId) {
        const ownerId = nextState.propertyOwnership[propertyId];
        if (ownerId === null) {
          const property = getPropertyById(nextState, propertyId);
          nextState.phase = player.cash >= property.purchasePrice ? "Buy" : "Resolve";
        } else if (ownerId !== action.playerId) {
          const owner = nextState.players[ownerId];
          const property = getPropertyById(nextState, propertyId);
          const rentAmount = calculateRent(property, nextState, ownerId);
          const amountPaid = Math.min(player.cash, rentAmount);

          player.cash -= amountPaid;
          owner.cash += amountPaid;

          events.push({
            type: "RENT_PAID",
            payerId: action.playerId,
            recipientId: ownerId,
            amount: amountPaid,
            propertyId
          });

          if (amountPaid < rentAmount) {
            if (!nextState.bankruptPlayers.includes(action.playerId)) {
              nextState.bankruptPlayers.push(action.playerId);
            }
            events.push({
              type: "BANKRUPT",
              playerId: action.playerId,
              owedTo: ownerId
            });
            nextState.phase = "EndTurn";
          } else {
            nextState.phase = "Resolve";
          }
        } else {
          nextState.phase = "Resolve";
        }
      } else {
        nextState.phase = "Resolve";
      }

      break;
    }

    case "BUY": {
      validateTurn(nextState, action.playerId, "Buy");

      const player = nextState.players[action.playerId];
      const tile = getTileForPlayer(nextState, action.playerId);
      const propertyId = ownableTilePropertyId(tile);

      if (!propertyId || propertyId !== action.propertyId) {
        throw new Error(`Player ${action.playerId} is not on property ${action.propertyId}`);
      }

      if (!isPropertyAvailable(nextState, action.propertyId)) {
        throw new Error(`Property ${action.propertyId} is already owned`);
      }

      const property = getPropertyById(nextState, action.propertyId);
      if (player.cash < property.purchasePrice) {
        throw new Error(`Player ${action.playerId} cannot afford property ${action.propertyId}`);
      }

      player.cash -= property.purchasePrice;
      player.properties.push(action.propertyId);
      nextState.propertyOwnership[action.propertyId] = action.playerId;

      events.push({
        type: "PURCHASED",
        playerId: action.playerId,
        propertyId: action.propertyId,
        price: property.purchasePrice
      });

      nextState.phase = "Resolve";
      break;
    }

    case "PASS": {
      validateTurn(nextState, action.playerId, "Buy");
      nextState.phase = "Resolve";
      break;
    }

    case "END_TURN": {
      if (!isOneOfPhases(nextState.phase, ["Resolve", "EndTurn"])) {
        throw new Error(`Cannot end turn during ${nextState.phase} phase`);
      }
      if (action.playerId !== nextState.currentPlayerId) {
        throw new Error(`Not ${action.playerId}'s turn`);
      }

      advanceToNextPlayer(nextState);
      nextState.phase = "Roll";
      break;
    }

    case "BUILD":
    case "MORTGAGE":
    case "UNMORTGAGE":
    case "TRADE_OFFER":
    case "TRADE_ACCEPT":
      // Reserved for future tickets
      break;

    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled action ${(exhaustiveCheck as GameAction).type}`);
    }
  }

  return { state: nextState, events };
}

function validateTurn(state: GameState, playerId: string, requiredPhase: string): void {
  if (state.currentPlayerId !== playerId) {
    throw new Error(`It is not player ${playerId}'s turn`);
  }
  if (state.phase !== requiredPhase) {
    throw new Error(`Action requires phase ${requiredPhase} but was ${state.phase}`);
  }
}

function isOneOfPhases(phase: string, allowed: string[]): boolean {
  return allowed.includes(phase);
}

function advanceToNextPlayer(state: GameState): void {
  const order = state.config.playerOrder;
  if (order.length === 0) {
    return;
  }

  let index = state.currentPlayerIndex;
  let cycles = 0;
  do {
    index = (index + 1) % order.length;
    cycles += 1;
  } while (
    cycles <= order.length &&
    state.bankruptPlayers.includes(order[index])
  );

  state.currentPlayerIndex = index;
  state.currentPlayerId = order[index];
  if (index === 0) {
    state.turn += 1;
  }
}

function calculateRent(property: Property, state: GameState, ownerId: string): number {
  const owner = state.players[ownerId];
  const houses = owner.houses[property.id] ?? 0;

  if (property.rentWithHouses && houses > 0) {
    const index = Math.min(houses, property.rentWithHouses.length - 1);
    return property.rentWithHouses[index];
  }

  return property.baseRent;
}
