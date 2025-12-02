# Monopoly Client

React-based game client for the Monopoly Rules Engine with complete audio system integration.

## Features

- Complete audio system using Howler.js
- Sound effects for all game actions:
  - Dice rolling
  - Property purchases
  - Rent payments
  - Building houses
  - Money transactions
  - Game win/lose events
  - Player movements
- Background music with looping
- Audio settings UI with:
  - Volume control (0-100%)
  - Mute/unmute toggle
  - Background music toggle
  - Sound effects toggle
- LocalStorage persistence for audio preferences
- Interactive game board demonstration

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The client will start on http://localhost:5173

## Building

```bash
npm run build
```

## Audio Files

All audio files are located in `public/sounds/`:

- `dice_roll.mp3` - Dice rolling sound
- `property_buy.mp3` - Property purchase sound
- `rent_pay.mp3` - Rent payment sound
- `build_house.mp3` - Building house sound
- `game_win.mp3` - Victory fanfare
- `game_lose.mp3` - Defeat sound
- `player_move.mp3` - Movement sound
- `money_sound.mp3` - Money transaction sound
- `background_music.mp3` - Background music (looping)

## Audio Manager API

### Methods

- `initialize()` - Load all audio files
- `playDiceRoll()` - Play dice roll sound
- `playPropertyPurchase()` - Play property purchase sound
- `playRentPayment()` - Play rent payment sound
- `playPropertyUpgrade()` - Play house building sound
- `playGameOver(won: boolean)` - Play win/lose sound
- `playMove()` - Play movement sound
- `playMoneyTransaction()` - Play money transaction sound
- `playBackgroundMusic()` - Start background music
- `stopBackgroundMusic()` - Stop background music
- `setVolume(percent: number)` - Set volume (0-100)
- `toggleMute()` - Toggle mute state
- `setBackgroundMusicEnabled(enabled: boolean)` - Toggle background music
- `setSoundEffectsEnabled(enabled: boolean)` - Toggle sound effects
- `subscribe(listener)` - Subscribe to settings changes
- `dispose()` - Clean up audio resources

## License

MIT
