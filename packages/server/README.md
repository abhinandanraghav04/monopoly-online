# Monopoly Game Server

Express-based server providing lobby, profiles, and leaderboard APIs for the Monopoly game.

## Features

- **User Profiles**: Create and update player profiles with avatars and stats
- **Lobby Management**: In-memory room creation, join/leave, readiness tracking
- **Game History**: Record game results and update user statistics
- **Leaderboards**: Sort by wins, win rate, or level with pagination
- **Friends System**: Add friends and retrieve friend lists
- **Socket.io**: Real-time updates for lobby and leaderboard events

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## API Endpoints

- `POST /api/user` create profile
- `GET /api/user/:id` retrieve profile
- `PUT /api/user/:id` update profile
- `GET /api/leaderboard` retrieve leaderboard
- `POST /api/game/result` save game result
- `GET /api/game/history/:userId` user game history
- `POST /api/friends/:id` add friend
- `GET /api/friends/:id` get friend list
- `GET /api/rooms` list available rooms
- `GET /api/rooms/:id` get room details

## Socket Events

- `CREATE_ROOM` create lobby room
- `JOIN_ROOM` join existing room
- `LEAVE_ROOM` leave room
- `PLAYER_READY` toggle ready state

Server emits:

- `PLAYER_JOINED`
- `PLAYER_LEFT`
- `PLAYER_READY`
- `GAME_ENDED`
- `LEADERBOARD_UPDATE`

## Notes

This server uses an in-memory datastore for simplicity. Replace with a persistent database for production use.
