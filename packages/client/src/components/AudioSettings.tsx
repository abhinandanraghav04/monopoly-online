import React, { useState, useEffect } from 'react';
import { AudioManager, AudioSettings as AudioSettingsType } from '../audio/AudioManager';

interface AudioSettingsProps {
  audioManager: AudioManager;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ audioManager }) => {
  const [settings, setSettings] = useState<AudioSettingsType>(
    audioManager.getSettings()
  );

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, [audioManager]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    audioManager.setVolume(Number(e.target.value));
  };

  const handleMuteToggle = () => {
    audioManager.toggleMute();
  };

  const handleBackgroundMusicToggle = () => {
    audioManager.setBackgroundMusicEnabled(!settings.backgroundMusicEnabled);
  };

  const handleSoundEffectsToggle = () => {
    audioManager.setSoundEffectsEnabled(!settings.soundEffectsEnabled);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Audio Settings</h3>
      
      <div style={styles.control}>
        <label style={styles.label}>
          Volume: {settings.volume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.volume}
          onChange={handleVolumeChange}
          style={styles.slider}
          disabled={settings.muted}
        />
      </div>

      <div style={styles.control}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={settings.muted}
            onChange={handleMuteToggle}
            style={styles.checkbox}
          />
          Mute All Audio
        </label>
      </div>

      <div style={styles.control}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={settings.backgroundMusicEnabled}
            onChange={handleBackgroundMusicToggle}
            style={styles.checkbox}
            disabled={settings.muted}
          />
          Background Music
        </label>
      </div>

      <div style={styles.control}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={settings.soundEffectsEnabled}
            onChange={handleSoundEffectsToggle}
            style={styles.checkbox}
            disabled={settings.muted}
          />
          Sound Effects
        </label>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '300px',
    margin: '10px',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  control: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    marginRight: '8px',
    cursor: 'pointer',
    width: '18px',
    height: '18px',
  },
};
