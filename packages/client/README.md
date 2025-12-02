# Monopoly Game Client

React-based client application for the Monopoly game with lobby, profiles, and leaderboard functionality.

## Features

- **Lobby System**: Create and join game rooms with customizable settings
- **Player Profiles**: View player stats, game history, and achievements
- **Leaderboard**: Global and friend rankings with multiple sorting options
- **Real-time Updates**: Socket.io integration for live room updates

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

## Structure

- `src/pages/`: Main application pages (Lobby, Profile, Leaderboard)
- `src/components/`: Reusable React components
- `src/services/`: API client and state management (Zustand)
- `src/utils/`: Utility functions
