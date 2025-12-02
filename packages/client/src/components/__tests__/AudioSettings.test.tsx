import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioSettings } from '../AudioSettings';
import { AudioManager } from '../../audio/AudioManager';

vi.mock('howler', () => ({
  Howl: vi.fn(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    unload: vi.fn(),
  })),
  Howler: {
    volume: vi.fn(),
    mute: vi.fn(),
  },
}));

describe('AudioSettings', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    const store = new Map<string, string>();
    const mockLocalStorage = {
      get length() { return store.size; },
      clear: () => { store.clear(); },
      getItem: (key: string) => store.get(key) ?? null,
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      removeItem: (key: string) => { store.delete(key); },
      setItem: (key: string, value: string) => { store.set(key, value); },
    } as unknown as Storage;

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: mockLocalStorage,
      writable: true,
    });

    audioManager = new AudioManager();
  });

  it('should render audio settings controls', () => {
    render(<AudioSettings audioManager={audioManager} />);

    expect(screen.getByText('Audio Settings')).toBeInTheDocument();
    expect(screen.getByText(/Volume:/)).toBeInTheDocument();
    expect(screen.getByText('Mute All Audio')).toBeInTheDocument();
    expect(screen.getByText('Background Music')).toBeInTheDocument();
    expect(screen.getByText('Sound Effects')).toBeInTheDocument();
  });

  it('should display current volume level', () => {
    render(<AudioSettings audioManager={audioManager} />);
    expect(screen.getByText(/Volume: 70%/)).toBeInTheDocument();
  });

  it('should update volume when slider changes', async () => {
    render(<AudioSettings audioManager={audioManager} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });

    await waitFor(() => {
      expect(screen.getByText(/Volume: 50%/)).toBeInTheDocument();
    });

    expect(audioManager.getSettings().volume).toBe(50);
  });

  it('should toggle mute when checkbox clicked', async () => {
    render(<AudioSettings audioManager={audioManager} />);

    const muteCheckbox = screen.getByLabelText('Mute All Audio');
    fireEvent.click(muteCheckbox);

    await waitFor(() => {
      expect(audioManager.getSettings().muted).toBe(true);
    });
  });

  it('should toggle background music', async () => {
    render(<AudioSettings audioManager={audioManager} />);

    const bgMusicCheckbox = screen.getByLabelText('Background Music');
    fireEvent.click(bgMusicCheckbox);

    await waitFor(() => {
      expect(audioManager.getSettings().backgroundMusicEnabled).toBe(false);
    });
  });

  it('should toggle sound effects', async () => {
    render(<AudioSettings audioManager={audioManager} />);

    const sfxCheckbox = screen.getByLabelText('Sound Effects');
    fireEvent.click(sfxCheckbox);

    await waitFor(() => {
      expect(audioManager.getSettings().soundEffectsEnabled).toBe(false);
    });
  });

  it('should disable controls when muted', () => {
    audioManager.toggleMute();
    render(<AudioSettings audioManager={audioManager} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    const bgMusicCheckbox = screen.getByLabelText('Background Music') as HTMLInputElement;
    const sfxCheckbox = screen.getByLabelText('Sound Effects') as HTMLInputElement;

    expect(slider.disabled).toBe(true);
    expect(bgMusicCheckbox.disabled).toBe(true);
    expect(sfxCheckbox.disabled).toBe(true);
  });
});
