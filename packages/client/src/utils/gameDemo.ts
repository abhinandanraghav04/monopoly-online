import {
  createInitialGameState,
  type GameConfig,
  type GameTile,
  type Property
} from '@project/rules';

const demoBoard: GameTile[] = [
  {
    kind: 'GO',
    name: 'GO',
    payout: 200
  },
  {
    kind: 'PROPERTY',
    name: 'Starlight Square',
    propertyId: 'starlight-square',
    group: 'starlight'
  },
  {
    kind: 'CHANCE',
    name: 'Chance'
  },
  {
    kind: 'PROPERTY',
    name: 'Nebula Avenue',
    propertyId: 'nebula-avenue',
    group: 'nebula'
  },
  {
    kind: 'TAX',
    name: 'Galactic Tax',
    amount: 100
  },
  {
    kind: 'FREE_PARKING',
    name: 'Free Parking'
  },
  {
    kind: 'GO_TO_JAIL',
    name: 'Go To Jail'
  }
];

const demoProperties: Record<string, Property> = {
  'starlight-square': {
    id: 'starlight-square',
    name: 'Starlight Square',
    purchasePrice: 180,
    baseRent: 18,
    group: 'starlight',
    type: 'PROPERTY'
  },
  'nebula-avenue': {
    id: 'nebula-avenue',
    name: 'Nebula Avenue',
    purchasePrice: 220,
    baseRent: 22,
    group: 'nebula',
    type: 'PROPERTY'
  }
};

export function createDemoGame(): ReturnType<typeof createInitialGameState> {
  const config: GameConfig = {
    gameId: 'demo-game-001',
    seed: Date.now(),
    startingCash: 1500,
    goBonus: 200,
    board: demoBoard,
    properties: demoProperties,
    playerOrder: ['player1', 'player2']
  };

  return createInitialGameState(config);
}
