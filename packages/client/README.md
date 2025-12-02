# Client Package

React + TypeScript + Vite client for the game.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- TailwindCSS for styling (dark theme)
- Socket.io-client for real-time communication
- Howler.js for audio
- React Router for navigation

## Development

```bash
npm run dev
```

Starts the development server at http://localhost:5173

## Building

```bash
npm run build
```

Builds the production-ready client to `dist/`

## Linting & Formatting

```bash
npm run lint
npm run format
```

## Structure

- `src/pages/` - Main page components (Home, Game)
- `src/components/` - Reusable UI components (Board, PlayerCard, DiceRoller)
- `src/services/` - Service modules (socket connection)
- `src/styles/` - Global styles and Tailwind configuration
