import {
  QUICK_6x6,
  CLASSIC_8x8,
  EXTENDED_12x12,
  MEGA_16x16,
  createInitialGameState,
  type BoardModel,
  type GameConfig,
  type GameState,
  type Tile as BoardTile,
  type GameTile,
  type Property,
} from '@project/rules';

export type BoardSize = '6x6' | '8x8' | '12x12' | '16x16';

export function getBoardModel(size: BoardSize): BoardModel {
  switch (size) {
    case '6x6':
      return QUICK_6x6;
    case '8x8':
      return CLASSIC_8x8;
    case '12x12':
      return EXTENDED_12x12;
    case '16x16':
      return MEGA_16x16;
  }
}

function mapTileToGameTile(tile: BoardTile, model: BoardModel): GameTile {
  switch (tile.kind) {
    case 'PROPERTY':
      return {
        kind: 'PROPERTY',
        name: tile.name,
        propertyId: tile.propertyId,
        group: tile.groupId,
      };
    case 'GO':
      return {
        kind: 'GO',
        name: tile.name,
        payout: model.economy.goSalary,
      };
    case 'TAX':
      return {
        kind: 'TAX',
        name: tile.name,
        amount: tile.amount,
      };
    case 'UTILITY':
      return {
        kind: 'UTILITY',
        name: tile.name,
        propertyId: tile.id,
      };
    case 'RAILROAD':
      return {
        kind: 'RAILROAD',
        name: tile.name,
        propertyId: tile.id,
      };
    case 'CHANCE':
      return {
        kind: 'CHANCE',
        name: tile.name,
      };
    case 'COMMUNITY_CHEST':
      return {
        kind: 'COMMUNITY_CHEST',
        name: tile.name,
      };
    case 'JAIL':
      return {
        kind: 'JAIL',
        name: tile.name,
      };
    case 'FREE_PARKING':
      return {
        kind: 'FREE_PARKING',
        name: tile.name,
      };
    case 'GO_TO_JAIL':
      return {
        kind: 'GO_TO_JAIL',
        name: tile.name,
      };
    default:
      return {
        kind: tile.kind,
        name: tile.name,
      } as GameTile;
  }
}

function formatPropertyName(id: string): string {
  return id
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function mapEconomyProperty(property: BoardModel['economy']['properties'][string]): Property {
  return {
    id: property.id,
    name: formatPropertyName(property.id),
    purchasePrice: property.price,
    baseRent: property.rent.base,
    rentWithHouses: property.rent.houses,
    houseCost: property.houseCost,
    group: property.groupId,
    type: 'PROPERTY',
  };
}

export function createDemoGame(boardSize: BoardSize = '8x8', playerCount = 4): GameState {
  const boardModel = getBoardModel(boardSize);
  const playerIds = Array.from({ length: playerCount }, (_, index) => `player${index + 1}`);

  const gameBoard: GameTile[] = boardModel.config.tiles.map((tile) =>
    mapTileToGameTile(tile, boardModel)
  );

  const properties: Record<string, Property> = Object.fromEntries(
    Object.values(boardModel.economy.properties).map((property) => [
      property.id,
      mapEconomyProperty(property),
    ])
  );

  const config: GameConfig = {
    gameId: `demo-${boardSize}`,
    seed: Date.now(),
    startingCash: boardModel.economy.startingCash,
    goBonus: boardModel.economy.goSalary,
    board: gameBoard,
    properties,
    playerOrder: playerIds,
  };

  return createInitialGameState(config);
}
