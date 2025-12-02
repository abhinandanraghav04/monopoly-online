import { Howl, Howler } from 'howler';

export interface AudioSettings {
  volume: number;
  muted: boolean;
  backgroundMusicEnabled: boolean;
  soundEffectsEnabled: boolean;
}

type SoundName =
  | 'diceRoll'
  | 'propertyPurchase'
  | 'rentPayment'
  | 'propertyUpgrade'
  | 'gameWin'
  | 'gameLose'
  | 'playerMove'
  | 'moneyTransaction'
  | 'backgroundMusic';

const SOUND_FILES: Record<SoundName, string> = {
  diceRoll: '/sounds/dice_roll.mp3',
  propertyPurchase: '/sounds/property_buy.mp3',
  rentPayment: '/sounds/rent_pay.mp3',
  propertyUpgrade: '/sounds/build_house.mp3',
  gameWin: '/sounds/game_win.mp3',
  gameLose: '/sounds/game_lose.mp3',
  playerMove: '/sounds/player_move.mp3',
  moneyTransaction: '/sounds/money_sound.mp3',
  backgroundMusic: '/sounds/background_music.mp3',
};

const DEFAULT_SETTINGS: AudioSettings = {
  volume: 70,
  muted: false,
  backgroundMusicEnabled: true,
  soundEffectsEnabled: true,
};

const STORAGE_KEY = 'monopoly-audio-settings';

type SettingsListener = (settings: AudioSettings) => void;

export class AudioManager {
  private sounds: Map<SoundName, Howl> = new Map();
  private settings: AudioSettings;
  private backgroundMusicPlaying: boolean = false;
  private initialized: boolean = false;
  private listeners: Set<SettingsListener> = new Set();

  constructor() {
    this.settings = this.loadSettings();
    this.applySettings();
  }

  private loadSettings(): AudioSettings {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return { ...DEFAULT_SETTINGS };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load audio settings from localStorage:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save audio settings to localStorage:', error);
    }
  }

  private notify(): void {
    const snapshot = this.getSettings();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    listener(this.getSettings());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private applySettings(): void {
    Howler.volume(this.settings.volume / 100);
    Howler.mute(this.settings.muted);
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const loadPromises = (Object.keys(SOUND_FILES) as SoundName[]).map((name) => {
      return new Promise<void>((resolve, reject) => {
        const isBackgroundMusic = name === 'backgroundMusic';
        
        const sound = new Howl({
          src: [SOUND_FILES[name]],
          loop: isBackgroundMusic,
          volume: isBackgroundMusic ? 0.4 : 1.0,
          preload: true,
          onload: () => resolve(),
          onloaderror: (_id, error) => {
            console.error(`Failed to load sound ${name}:`, error);
            reject(error);
          },
        });

        this.sounds.set(name, sound);
      });
    });

    try {
      await Promise.all(loadPromises);
      this.initialized = true;
      console.log('AudioManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize some audio files:', error);
      throw error;
    }
  }

  private playSound(name: SoundName): void {
    if (!this.initialized) {
      console.warn('AudioManager not initialized yet');
      return;
    }

    if (!this.settings.soundEffectsEnabled && name !== 'backgroundMusic') {
      return;
    }

    const sound = this.sounds.get(name);
    if (sound) {
      sound.play();
    } else {
      console.warn(`Sound ${name} not found`);
    }
  }

  playDiceRoll(): void {
    this.playSound('diceRoll');
  }

  playPropertyPurchase(): void {
    this.playSound('propertyPurchase');
  }

  playRentPayment(): void {
    this.playSound('rentPayment');
  }

  playPropertyUpgrade(): void {
    this.playSound('propertyUpgrade');
  }

  playGameOver(won: boolean): void {
    if (won) {
      this.playSound('gameWin');
    } else {
      this.playSound('gameLose');
    }
  }

  playMove(): void {
    this.playSound('playerMove');
  }

  playMoneyTransaction(): void {
    this.playSound('moneyTransaction');
  }

  playBackgroundMusic(): void {
    if (!this.initialized || !this.settings.backgroundMusicEnabled) {
      return;
    }

    const music = this.sounds.get('backgroundMusic');
    if (music && !this.backgroundMusicPlaying) {
      music.play();
      this.backgroundMusicPlaying = true;
    }
  }

  stopBackgroundMusic(): void {
    const music = this.sounds.get('backgroundMusic');
    if (music && this.backgroundMusicPlaying) {
      music.stop();
      this.backgroundMusicPlaying = false;
    }
  }

  setVolume(percent: number): void {
    const clamped = Math.max(0, Math.min(100, percent));
    this.settings.volume = clamped;
    Howler.volume(clamped / 100);
    this.saveSettings();
    this.notify();
  }

  toggleMute(): void {
    this.settings.muted = !this.settings.muted;
    Howler.mute(this.settings.muted);
    this.saveSettings();
    this.notify();
  }

  setBackgroundMusicEnabled(enabled: boolean): void {
    this.settings.backgroundMusicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    } else if (enabled && this.initialized) {
      this.playBackgroundMusic();
    }
    this.saveSettings();
    this.notify();
  }

  setSoundEffectsEnabled(enabled: boolean): void {
    this.settings.soundEffectsEnabled = enabled;
    this.saveSettings();
    this.notify();
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  dispose(): void {
    this.stopBackgroundMusic();
    this.sounds.forEach((sound) => {
      sound.unload();
    });
    this.sounds.clear();
    this.listeners.clear();
    this.initialized = false;
  }
}

let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}
