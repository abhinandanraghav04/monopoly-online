import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioManager } from '../AudioManager';

const mockHowl = {
  play: vi.fn(),
  stop: vi.fn(),
  unload: vi.fn(),
};

vi.mock('howler', () => ({
  Howl: vi.fn(() => mockHowl),
  Howler: {
    volume: vi.fn(),
    mute: vi.fn(),
  },
}));

describe('AudioManager', () => {
  let manager: AudioManager;
  let originalLocalStorage: Storage | undefined;

  beforeEach(() => {
    originalLocalStorage = globalThis.localStorage;
    const store = new Map<string, string>();

    const mockLocalStorage = {
      get length() {
        return store.size;
      },
      clear: () => {
        store.clear();
      },
      getItem: (key: string) => store.get(key) ?? null,
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      removeItem: (key: string) => {
        store.delete(key);
      },
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    } as unknown as Storage;

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: mockLocalStorage,
      writable: true,
    });

    manager = new AudioManager();
  });

  afterEach(() => {
    manager.dispose();
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: originalLocalStorage,
        writable: true,
      });
    }
    vi.clearAllMocks();
  });

  it('should initialize with default settings', () => {
    const settings = manager.getSettings();
    expect(settings.volume).toBe(70);
    expect(settings.muted).toBe(false);
    expect(settings.backgroundMusicEnabled).toBe(true);
    expect(settings.soundEffectsEnabled).toBe(true);
  });

  it('should update volume', () => {
    manager.setVolume(50);
    const settings = manager.getSettings();
    expect(settings.volume).toBe(50);
  });

  it('should clamp volume between 0 and 100', () => {
    manager.setVolume(150);
    expect(manager.getSettings().volume).toBe(100);

    manager.setVolume(-10);
    expect(manager.getSettings().volume).toBe(0);
  });

  it('should toggle mute', () => {
    manager.toggleMute();
    expect(manager.getSettings().muted).toBe(true);

    manager.toggleMute();
    expect(manager.getSettings().muted).toBe(false);
  });

  it('should toggle background music', () => {
    manager.setBackgroundMusicEnabled(false);
    expect(manager.getSettings().backgroundMusicEnabled).toBe(false);

    manager.setBackgroundMusicEnabled(true);
    expect(manager.getSettings().backgroundMusicEnabled).toBe(true);
  });

  it('should toggle sound effects', () => {
    manager.setSoundEffectsEnabled(false);
    expect(manager.getSettings().soundEffectsEnabled).toBe(false);

    manager.setSoundEffectsEnabled(true);
    expect(manager.getSettings().soundEffectsEnabled).toBe(true);
  });

  it('should persist settings to localStorage', () => {
    manager.setVolume(80);
    manager.toggleMute();

    const stored = localStorage.getItem('monopoly-audio-settings');
    expect(stored).toBeTruthy();
    
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.volume).toBe(80);
      expect(parsed.muted).toBe(true);
    }
  });

  it('should load settings from localStorage', () => {
    localStorage.setItem(
      'monopoly-audio-settings',
      JSON.stringify({ volume: 60, muted: true })
    );

    const newManager = new AudioManager();
    const settings = newManager.getSettings();
    
    expect(settings.volume).toBe(60);
    expect(settings.muted).toBe(true);
    
    newManager.dispose();
  });

  it('should notify listeners when settings change', () => {
    const listener = vi.fn();
    manager.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);

    manager.setVolume(90);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ volume: 90 })
    );
  });

  it('should unsubscribe listeners', () => {
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    manager.setVolume(90);
    
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should clean up resources on dispose', () => {
    const listener = vi.fn();
    manager.subscribe(listener);

    manager.dispose();

    manager.setVolume(90);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
