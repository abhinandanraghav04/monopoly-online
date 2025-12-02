import {
  GameId,
  Phase,
  PlayerId,
  PropertyId,
  Turn,
  Money,
  BoardCoord
} from "./types";
import { PlayerState, Property, Tile, isOwnableTile } from "./entities";
import { DiceRollResult } from "./dice";

export interface GameConfig {
  gameId: GameId;
  seed: number | string;
  startingCash: Money;
  goBonus: Money;
  board: Tile[];
  properties: Record<PropertyId, Property>;
  playerOrder: PlayerId[];
}

export interface GameState {
  id: GameId;
  config: GameConfig;
  turn: Turn;
  phase: Phase;
  currentPlayerIndex: number;
  currentPlayerId: PlayerId;
  players: Record<PlayerId, PlayerState>;
  propertyOwnership: Record<PropertyId, PlayerId | null>;
  diceHistory: DiceRollResult[];
  bankruptPlayers: PlayerId[];
}

export function createInitialGameState(config: GameConfig): GameState {
  if (config.playerOrder.length === 0) {
    throw new Error("Game configuration must include at least one player");
  }

  const players = Object.fromEntries(
    config.playerOrder.map((playerId) => [
      playerId,
      createEmptyPlayerState(playerId, config.startingCash)
    ])
  ) as Record<PlayerId, PlayerState>;

  const propertyOwnership = Object.fromEntries(
    Object.keys(config.properties).map((propertyId) => [propertyId, null as PlayerId | null])
  ) as Record<PropertyId, PlayerId | null>;

  return {
    id: config.gameId,
    config,
    turn: 1,
    phase: "Roll",
    currentPlayerIndex: 0,
    currentPlayerId: config.playerOrder[0],
    players,
    propertyOwnership,
    diceHistory: [],
    bankruptPlayers: []
  };
}

export function getCurrentPlayer(state: GameState): PlayerState {
  return state.players[state.currentPlayerId];
}

export function getTileAtPosition(state: GameState, position: BoardCoord): Tile {
  const index = position % state.config.board.length;
  return state.config.board[index];
}

export function getTileForPlayer(state: GameState, playerId: PlayerId): Tile {
  const player = state.players[playerId];
  return getTileAtPosition(state, player.position);
}

export function getPropertyById(state: GameState, propertyId: PropertyId): Property {
  const property = state.config.properties[propertyId];
  if (!property) {
    throw new Error(`Unknown property id: ${propertyId}`);
  }
  return property;
}

export function isPropertyAvailable(state: GameState, propertyId: PropertyId): boolean {
  return state.propertyOwnership[propertyId] === null;
}

export function isPlayerBankrupt(state: GameState, playerId: PlayerId): boolean {
  return state.bankruptPlayers.includes(playerId);
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    players: Object.fromEntries(
      Object.entries(state.players).map(([playerId, playerState]) => [
        playerId,
        {
          ...playerState,
          properties: [...playerState.properties],
          houses: { ...playerState.houses }
        }
      ])
    ) as Record<PlayerId, PlayerState>,
    propertyOwnership: { ...state.propertyOwnership },
    diceHistory: [...state.diceHistory],
    bankruptPlayers: [...state.bankruptPlayers]
  };
}

export function ownableTilePropertyId(tile: Tile): PropertyId | null {
  if (!isOwnableTile(tile)) {
    return null;
  }
  return tile.propertyId;
}

function createEmptyPlayerState(playerId: PlayerId, startingCash: Money): PlayerState {
  return {
    id: playerId,
    cash: startingCash,
    position: 0,
    properties: [],
    houses: {},
    jailed: false,
    getOutOfJailCards: 0
  };
}
