import React, { useEffect, useState } from 'react';
import { getAudioManager } from '../audio/AudioManager';
import { AudioSettings } from './AudioSettings';
import { GameBoard } from './GameBoard';

export const Game: React.FC = () => {
  const [audioManager] = useState(() => getAudioManager());
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioManager.initialize();
        setAudioInitialized(true);
        audioManager.playBackgroundMusic();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setInitError('Failed to load audio. Some sounds may not play.');
      }
    };

    initAudio();

    return () => {
      audioManager.dispose();
    };
  }, [audioManager]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Monopoly Game</h1>
        <button
          style={styles.settingsButton}
          onClick={() => setShowSettings(!showSettings)}
        >
          🔊 Audio Settings
        </button>
      </header>

      {initError && (
        <div style={styles.error}>
          {initError}
        </div>
      )}

      {!audioInitialized && !initError && (
        <div style={styles.loading}>
          Loading audio...
        </div>
      )}

      <div style={styles.content}>
        {showSettings && (
          <div style={styles.settingsPanel}>
            <AudioSettings audioManager={audioManager} />
          </div>
        )}

        <GameBoard audioManager={audioManager} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a2e',
    color: '#eee',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#16213e',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#0f3460',
    color: '#eee',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    padding: '10px',
    margin: '20px',
    backgroundColor: '#d32f2f',
    color: 'white',
    borderRadius: '5px',
    textAlign: 'center',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    fontSize: '18px',
  },
  content: {
    padding: '20px',
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  settingsPanel: {
    flexShrink: 0,
  },
};
