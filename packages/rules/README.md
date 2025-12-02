# @project/rules

Shared TypeScript rules engine package for the game. This package provides a deterministic, pure-functional game engine with core domain types, seedable random number generation, dice mechanics, and turn/phase scaffolding.

## Features

- **Pure reducer architecture**: All game state transitions are pure functions
- **Deterministic RNG**: Mulberry32 PRNG for reproducible game sessions
- **Type-safe actions and events**: Full TypeScript support with discriminated unions
- **Simulation harness**: Bot logic for testing and AI development
- **Comprehensive test coverage**: 90%+ coverage with unit and snapshot tests

## Installation

```bash
npm install @project/rules
```

## Core Concepts

### Game State

The game state is immutable and contains:
- Player positions, cash, and property ownership
- Current turn and phase
- Board layout and property definitions
- Game configuration (seed, starting cash, etc.)

### Actions

Actions represent player intentions:
- `ROLL`: Roll dice and move
- `BUY`: Purchase property at current position
- `PASS`: Decline to purchase
- `BUILD`: Build houses on property
- `MORTGAGE`: Mortgage property for cash
- `UNMORTGAGE`: Unmortgage property
- `TRADE_OFFER`: Propose a trade
- `TRADE_ACCEPT`: Accept a trade
- `END_TURN`: End current turn

### Events

Events represent what happened:
- `MOVED`: Player moved positions
- `PURCHASED`: Property purchased
- `RENT_PAID`: Rent paid to property owner
- `BUILT`: Houses built
- `MORTGAGED`: Property mortgaged
- `BANKRUPT`: Player went bankrupt
- `CARD_DRAWN`: Card drawn from deck

### Phases

Game turns progress through phases:
- `Roll`: Player must roll dice
- `Move`: Processing movement
- `Buy`: Option to buy property
- `Build`: Option to build houses
- `Trade`: Trading phase
- `Resolve`: Resolve effects
- `EndTurn`: Turn ending

## Usage

### Basic Example

```typescript
import {
  createInitialGameState,
  reduceGameState,
  createRng,
  GameConfig
} from "@project/rules";

// Create game configuration
const config: GameConfig = {
  gameId: "game-1",
  seed: 42,
  startingCash: 1500,
  goBonus: 200,
  playerOrder: ["alice", "bob"],
  board: [
    // ... board tiles
  ],
  properties: {
    // ... property definitions
  }
};

// Initialize game state
const state = createInitialGameState(config);
const rng = createRng(config.seed);

// Process a player action
const result = reduceGameState(
  state,
  { type: "ROLL", playerId: "alice" },
  rng
);

console.log(result.state); // New game state
console.log(result.events); // Events that occurred
```

### Simulation

```typescript
import { runSingleTurn, runMultipleTurns } from "@project/rules";

// Run a single turn with basic bot logic
const turnResult = runSingleTurn(state, rng);

// Run multiple turns
const multiResult = runMultipleTurns(state, rng, 10);
```

### Deterministic RNG

```typescript
import { createRng, diceRoll } from "@project/rules";

// Numeric seed
const rng1 = createRng(12345);

// String seed (hashed internally)
const rng2 = createRng("my-seed");

// Roll dice
const roll = diceRoll(rng1);
console.log(roll.dice); // [d1, d2]
console.log(roll.total); // d1 + d2
console.log(roll.isDouble); // d1 === d2
```

## Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build package
npm run build

# Lint code
npm run lint
```

## Architecture

The package follows a pure functional reducer pattern:
- All state transitions are deterministic
- No side effects in core logic
- RNG is explicitly threaded through operations
- Events are emitted alongside state changes

This design enables:
- Time-travel debugging
- Replay functionality
- Multiplayer synchronization
- AI/bot development
- Property-based testing
