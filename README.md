# Monopoly Board Models

Configurable board models for a Monopoly-like game with support for multiple board sizes.

## Features

- **Four board sizes**: 6x6, 8x8, 12x12, and 16x16
- **Property groups**: Configurable monopoly color groups with economic data
- **Movement helpers**: Navigate the board clockwise with automatic wrapping
- **Economic presets**: Tunable starting cash, GO salary, and rent multipliers
- **Special tiles**: GO, Jail, Free Parking, Go To Jail, Chance, Community Chest, Tax, Utilities, Railroads

## Installation

```bash
npm install
```

## Usage

### Importing Board Models

```typescript
import { QUICK_6x6, CLASSIC_8x8, EXTENDED_12x12, MEGA_16x16 } from './packages/rules/src';

const board = CLASSIC_8x8;
console.log(board.config.tileCount); // 32
console.log(board.economy.startingCash); // 1500
```

### Movement Helpers

```typescript
import { nextIndex, isCorner } from './packages/rules/src';

const currentIndex = 5;
const nextPosition = nextIndex(CLASSIC_8x8, currentIndex, 7);

if (isCorner(CLASSIC_8x8, nextPosition)) {
  console.log('Landed on a corner!');
}
```

### Property Groups

```typescript
const groups = CLASSIC_8x8.groups;

Object.entries(groups).forEach(([groupId, group]) => {
  console.log(`${group.label}: ${group.monopolySize} properties`);
  console.log(`  Properties: ${group.propertyIds.join(', ')}`);
});
```

### Accessing Tile Data

```typescript
const tiles = CLASSIC_8x8.config.tiles;

tiles.forEach((tile) => {
  if (tile.kind === 'PROPERTY') {
    console.log(`${tile.name}: $${tile.price}`);
    console.log(`  Base rent: $${tile.rent.base}`);
    console.log(`  With 1 house: $${tile.rent.houses[0]}`);
    console.log(`  With hotel: $${tile.rent.hotel}`);
  }
});
```

## Board Sizes

### Quick 6x6 (24 tiles)
- Fast-paced gameplay
- 12 properties across 6 color groups
- Starting cash: $1000
- GO salary: $150

### Classic 8x8 (32 tiles)
- Traditional Monopoly experience
- 18 properties across 8 color groups
- Starting cash: $1500
- GO salary: $200

### Extended 12x12 (48 tiles)
- Longer games with more properties
- 30 properties across 10 color groups
- Starting cash: $2500
- GO salary: $300

### Mega 16x16 (64 tiles)
- Epic gameplay experience
- 46 properties across 12 color groups
- Starting cash: $3000
- GO salary: $400

## Creating Custom Boards

You can create custom board models using the `buildBoardModel` function:

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
    // ... add 22 more tiles
  ],
});
```

## Testing

Run the test suite:

```bash
npm test
```

The tests cover:
- Valid board configurations
- Correct tile counts and side lengths
- Movement helpers (nextIndex, isCorner)
- Property group consistency
- Rent table validation
- Special tile placement

## License

MIT
