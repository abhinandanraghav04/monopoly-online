# Monopoly Web App

Interactive canvas-based Monopoly game interface built with React and TypeScript.

## Features

### Canvas Board Component
- Supports all 4 board sizes: 6x6, 8x8, 12x12, 16x16
- Smooth tile rendering with property group colors
- Interactive hover tooltips showing property details
- Zoom and pan support (mouse wheel + drag)
- Real-time player piece positioning
- Animated 60 FPS rendering

### Game Components
- **DiceRoller**: Beautiful dice animation with roll button
- **PlayerCard**: Displays player info, balance, properties
- **PropertyMarket**: Buy/sell/mortgage/trade property UI
- **GameLayout**: Responsive grid layout with sidebars
- **ActionLog**: Real-time event feed

### Utilities
- **canvas-helpers.ts**: Board layout calculations and rendering
- **game-demo.ts**: Demo game setup for testing
- **formatting.ts**: Money, player name formatting

## Running the App

```bash
# Install dependencies (from root)
npm install

# Start development server
cd packages/web
npm run dev
```

The app will be available at `http://localhost:3000`

## Game Controls

- **Roll Dice**: Click the "Roll Dice" button during Roll phase
- **Buy Property**: Click "Buy Property" or click on tile when on a property
- **Pass**: Skip buying a property
- **Zoom**: Use mouse wheel or +/- buttons
- **Pan**: Click and drag the board
- **Hover**: Hover over tiles to see property details

## Architecture

The app uses:
- React 18 with TypeScript
- Canvas 2D API for board rendering
- @project/rules for game engine
- Vite for dev server and bundling

## Phase Status

✅ Phase 1B Complete:
- Canvas board component with all board sizes
- Dice roller with animations
- Player cards with real-time updates
- Property market UI
- Game layout with sidebars
- Action log component
- Demo game setup
- Utility helpers

Ready for Phase 2: Multiplayer integration
