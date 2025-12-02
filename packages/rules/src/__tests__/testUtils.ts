import { createInitialGameState, type GameConfig } from "../state";
import type { GameState } from "../state";
import type { Tile, Property } from "../entities";

const baseBoard: Tile[] = [
  { kind: "GO", name: "Go", payout: 200 },
  { kind: "PROPERTY", name: "Mediterranean Avenue", propertyId: "prop_1", group: "brown" },
  { kind: "PROPERTY", name: "Baltic Avenue", propertyId: "prop_2", group: "brown" },
  { kind: "PROPERTY", name: "Oriental Avenue", propertyId: "prop_3", group: "lightblue" }
];

const baseProperties: Record<string, Property> = {
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
  },
  prop_3: {
    id: "prop_3",
    name: "Oriental Avenue",
    purchasePrice: 100,
    baseRent: 6,
    rentWithHouses: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    group: "lightblue",
    type: "PROPERTY"
  }
};

export function createTestConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return {
    gameId: overrides.gameId ?? "test-game",
    seed: overrides.seed ?? 42,
    startingCash: overrides.startingCash ?? 1500,
    goBonus: overrides.goBonus ?? 200,
    playerOrder: overrides.playerOrder ?? ["player1", "player2"],
    board: overrides.board ? cloneBoard(overrides.board) : cloneBoard(baseBoard),
    properties: overrides.properties ? cloneProperties(overrides.properties) : cloneProperties(baseProperties),
    ...overrides,
    board: overrides.board ? cloneBoard(overrides.board) : cloneBoard(baseBoard),
    properties: overrides.properties ? cloneProperties(overrides.properties) : cloneProperties(baseProperties)
  };
}

export function createTestState(overrides: Partial<GameConfig> = {}): GameState {
  const config = createTestConfig(overrides);
  return createInitialGameState(config);
}

function cloneBoard(board: Tile[]): Tile[] {
  return board.map((tile) => ({ ...tile }));
}

function cloneProperties(properties: Record<string, Property>): Record<string, Property> {
  return Object.fromEntries(
    Object.entries(properties).map(([id, prop]) => [id, { ...prop }])
  );
}
