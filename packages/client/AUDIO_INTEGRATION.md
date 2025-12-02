# Audio System Integration Guide

## Overview

The Monopoly game client now includes a complete audio system powered by Howler.js. This document describes the implementation and how to use it.

## Features Implemented

### 1. AudioManager (`src/audio/AudioManager.ts`)

The central class managing all audio in the application.

#### Methods:

- **`initialize()`** - Load all audio files (must be called before playing sounds)
- **`playDiceRoll()`** - Play dice roll sound
- **`playPropertyPurchase()`** - Play property purchase success sound
- **`playRentPayment()`** - Play rent payment sound
- **`playPropertyUpgrade()`** - Play house building sound
- **`playGameOver(won: boolean)`** - Play win or lose sound
- **`playMove()`** - Play player movement sound
- **`playMoneyTransaction()`** - Play money transaction sound
- **`playBackgroundMusic()`** - Start looping background music
- **`stopBackgroundMusic()`** - Stop background music
- **`setVolume(percent: number)`** - Set master volume (0-100)
- **`toggleMute()`** - Toggle mute state
- **`setBackgroundMusicEnabled(enabled: boolean)`** - Enable/disable background music
- **`setSoundEffectsEnabled(enabled: boolean)`** - Enable/disable sound effects
- **`subscribe(listener)`** - Subscribe to settings changes
- **`dispose()`** - Clean up audio resources

#### Usage Example:

```typescript
import { getAudioManager } from './audio/AudioManager';

const audioManager = getAudioManager();
await audioManager.initialize();

// Play sounds
audioManager.playDiceRoll();
audioManager.playPropertyPurchase();

// Control volume
audioManager.setVolume(80);
audioManager.toggleMute();

// Subscribe to changes
const unsubscribe = audioManager.subscribe((settings) => {
  console.log('Volume:', settings.volume);
  console.log('Muted:', settings.muted);
});
```

### 2. Audio Files (`public/sounds/`)

All sound effects are stored as MP3 files:

| File | Purpose | Duration | Description |
|------|---------|----------|-------------|
| `dice_roll.mp3` | Dice rolling | 1.5s | Wobbling noise effect |
| `property_buy.mp3` | Property purchase | 0.5s | Ascending chime |
| `rent_pay.mp3` | Rent payment | 1.0s | Descending tones |
| `build_house.mp3` | Build house | 0.8s | Quick ascending scale |
| `game_win.mp3` | Game victory | 2.5s | Happy fanfare |
| `game_lose.mp3` | Game defeat | 1.5s | Sad descending tones |
| `player_move.mp3` | Player movement | 0.3s | Subtle click |
| `money_sound.mp3` | Money transaction | 0.5s | Cash register effect |
| `background_music.mp3` | Background music | 12s | Looping ambient music |

### 3. AudioSettings Component (`src/components/AudioSettings.tsx`)

A React component providing UI controls for audio settings.

#### Features:
- Volume slider (0-100%)
- Mute all audio toggle
- Background music toggle
- Sound effects toggle
- Real-time updates via subscription
- Disabled state when muted

#### Usage:

```tsx
import { AudioSettings } from './components/AudioSettings';
import { getAudioManager } from './audio/AudioManager';

const audioManager = getAudioManager();

<AudioSettings audioManager={audioManager} />
```

### 4. Game Integration

The `Game.tsx` component demonstrates full integration:

- Initializes AudioManager on mount
- Starts background music automatically
- Shows audio settings panel (toggleable)
- Cleans up resources on unmount
- Error handling for audio loading failures

The `GameBoard.tsx` component integrates audio with game actions:

- Dice rolls trigger dice_roll sound
- Property purchases trigger property_buy sound
- Rent payments trigger rent_pay sound
- Building houses triggers build_house sound
- Money transactions trigger money_sound sound
- Player movement triggers player_move sound
- Game over triggers win/lose sounds

### 5. LocalStorage Persistence

Audio settings are automatically saved to localStorage under the key `monopoly-audio-settings`:

```json
{
  "volume": 70,
  "muted": false,
  "backgroundMusicEnabled": true,
  "soundEffectsEnabled": true
}
```

Settings persist across browser sessions.

### 6. Testing

Comprehensive test coverage:

- **AudioManager tests** (`src/audio/__tests__/AudioManager.test.ts`)
  - Settings management
  - Volume control
  - Mute functionality
  - Subscription pattern
  - LocalStorage persistence

- **AudioSettings tests** (`src/components/__tests__/AudioSettings.test.tsx`)
  - UI rendering
  - User interactions
  - State synchronization
  - Disabled states

Run tests with: `npm test`

## Browser Compatibility

Howler.js provides excellent cross-browser support:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

1. **Lazy Loading**: Audio files are loaded only after `initialize()` is called
2. **Preloading**: All sounds are preloaded for instant playback
3. **Sound Pooling**: Howler.js handles sound instance pooling automatically
4. **Memory Management**: Call `dispose()` when unmounting to free resources

## Future Enhancements

Potential improvements:

1. Add more sound variations
2. Implement 3D spatial audio for board position
3. Add sound categories (music, SFX, UI)
4. Implement fade-in/fade-out transitions
5. Add audio ducking (lower music when SFX plays)
6. Support custom sound packs
7. Add audio visualizer
8. Implement accessibility options (e.g., screen reader announcements)

## Troubleshooting

### Audio doesn't play
- Check browser console for errors
- Ensure `initialize()` was called before playing sounds
- Verify audio files exist in `public/sounds/`
- Check if browser requires user interaction before playing audio

### Volume control doesn't work
- Verify volume is between 0-100
- Check if mute is enabled
- Ensure sound effects/background music are enabled

### Settings don't persist
- Check localStorage is available (not in private browsing)
- Verify localStorage quota hasn't been exceeded
- Check browser console for localStorage errors

## License

MIT
