# Monopoly Rules Engine

Unified TypeScript rules engine for a Monopoly-inspired board game. This package combines configurable board models with a deterministic multiplayer-ready core engine, allowing you to build rich gameplay experiences across UI, audio, lobby, and deployment layers.

## Features

- **Board Model Library**: Four prebuilt boards (`QUICK_6x6`, `CLASSIC_8x8`, `EXTENDED_12x12`, `MEGA_16x16`) with validated layouts, tile metadata, and property groups.
- **Economy Presets**: Tunable presets with starting cash, GO salary, rent tables, and dynamic factory helpers for custom boards.
- **Core Game Engine**: Deterministic state reducer with phases (`Roll`, `Buy`, `Resolve`, `EndTurn`, etc.), property ownership, rent collection, and bankruptcy handling.
- **Deterministic RNG**: Seedable random number generator powering dice rolls and simulations for reproducible playthroughs.
- **Simulation Runner**: High-level helpers to execute single or multiple turns for AI, testing, or autoplay scenarios.
- **Shared Types**: Unified type system covering board definitions, runtime entities, game IDs, phases, player state, and monetary units.
- **Comprehensive Tests**: 78 Vitest specs covering board validation, movement helpers, dice, RNG, reducer logic, event sequencing, and end-to-end simulations.

## Quick Start & Deployment

Looking to get the full Monopoly Online experience (frontend + backend) running quickly? See the consolidated [Quick Start guide](./QUICKSTART.md) and the detailed [Production Deployment guide](./DEPLOYMENT.md).

## Installation

```bash
npm install
```

## Usage

### Importing Board Models

```typescript
import { CLASSIC_8x8 } from './packages/rules/src';

const board = CLASSIC_8x8;
console.log(board.config.tileCount); // 32
console.log(board.economy.startingCash); // 1500
```

### Using Movement Helpers

```typescript
import { nextIndex, isCorner, CLASSIC_8x8 } from './packages/rules/src';

const start = CLASSIC_8x8.config.startTileIndex;
const next = nextIndex(CLASSIC_8x8, start, 7);
console.log(isCorner(CLASSIC_8x8, next));
```

### Running the Core Engine

```typescript
import {
  createInitialGameState,
  reduceGameState,
  runSingleTurn,
  createRng,
  diceRoll,
  type GameAction,
  type GameState
} from './packages/rules/src';

const rng = createRng('seed-123');
const config = {
  gameId: 'game-1',
  seed: 42,
  startingCash: 1500,
  goBonus: 200,
  board: CLASSIC_8x8.config.tiles.map(tile => ({
    kind: tile.kind,
    name: tile.name,
    propertyId: tile.kind === 'PROPERTY' ? tile.propertyId : undefined,
    amount: tile.kind === 'TAX' ? tile.amount : undefined,
    payout: tile.kind === 'GO' ? CLASSIC_8x8.economy.goSalary : undefined,
  })),
  properties: Object.fromEntries(
    Object.values(CLASSIC_8x8.economy.properties).map(property => [
      property.id,
      {
        id: property.id,
        name: property.id,
        purchasePrice: property.price,
        baseRent: property.rent.base,
        rentWithHouses: property.rent.houses,
        houseCost: property.houseCost,
        group: property.groupId,
        type: 'PROPERTY' as const,
      }
    ])
  ),
  playerOrder: ['p1', 'p2']
};

let state = createInitialGameState(config);
const result = reduceGameState(state, { type: 'ROLL', playerId: 'p1' }, rng);
state = result.state;
console.log(result.events);
```

### Simulation Helpers

```typescript
import { runMultipleTurns, createRng, createInitialGameState } from './packages/rules/src';

const rng = createRng(12345);
const initialState = createInitialGameState(config);
const { state: finalState, events } = runMultipleTurns(initialState, rng, 10);
console.log(finalState.turn); // 6 (wraps after each player ends turn)
console.log(events.length);
```

## Creating Custom Boards

```typescript
import { buildBoardModel, buildEconomy, CLASSIC_PRESET } from './packages/rules/src';

const economy = buildEconomy({
  key: 'custom',
  label: 'Custom Board',
  preset: CLASSIC_PRESET,
  propertyGroups: [
    { id: 'red', label: 'Red', color: '#FF0000', propertyCount: 2 },
  ],
  properties: [
    { id: 'property-1', groupId: 'red', price: 100 },
    { id: 'property-2', groupId: 'red', price: 120 },
  ],
});

const customBoard = buildBoardModel({
  key: 'custom',
  label: 'Custom 6x6',
  sideLength: 6,
  economy,
  layout: [
    { type: 'GO' },
    { type: 'PROPERTY', propertyId: 'property-1' },
    // ... add remaining tiles
  ],
});
```

## Testing

```bash
# Root tests (board models)
npm test

# Package tests (core engine)
npm run test --workspace @project/rules
```

All 78 tests pass (40 board tests + 38 engine tests).

## Deployment

For production deployment instructions (Vercel frontend, Heroku/Railway backend, environment setup, and load testing script) see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Repository Layout

```
packages/rules/
├── README.md               # Package-specific docs
├── package.json            # Workspace package manifest
├── src/
│   ├── boards/             # Board definitions
│   ├── economy/            # Economy presets + factory
│   ├── __tests__/          # Engine unit tests
│   ├── actions.ts          # Game actions
│   ├── boardHelpers.ts     # Movement + group detection
│   ├── dice.ts             # Dice mechanics
│   ├── entities.ts         # Runtime entities & GameTile
│   ├── events.ts           # Event definitions
│   ├── index.ts            # Unified exports
│   ├── modelBuilder.ts     # Board model factory
│   ├── reducer.ts          # State reducer
│   ├── rng.ts              # Seeded RNG
│   ├── simulation.ts       # Simulation helpers
│   └── state.ts            # Game state helpers
└── tsconfig.json
```

For merge details and verification logs, see [`MERGE_VERIFICATION.md`](./MERGE_VERIFICATION.md).

## License

MIT
