import React, { useState } from 'react';
import { AudioManager } from '../audio/AudioManager';

interface DiceRollerProps {
  audioManager: AudioManager;
  onRoll?: (value: number) => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ audioManager, onRoll }) => {
  const [rolling, setRolling] = useState(false);
  const [dice1, setDice1] = useState<number | null>(null);
  const [dice2, setDice2] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const rollDice = () => {
    if (rolling) return;

    setRolling(true);
    audioManager.playDiceRoll();

    const animationDuration = 500;
    const frameInterval = 50;
    let elapsed = 0;

    const interval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      elapsed += frameInterval;

      if (elapsed >= animationDuration) {
        clearInterval(interval);
        const finalDice1 = Math.floor(Math.random() * 6) + 1;
        const finalDice2 = Math.floor(Math.random() * 6) + 1;
        const finalTotal = finalDice1 + finalDice2;

        setDice1(finalDice1);
        setDice2(finalDice2);
        setTotal(finalTotal);
        setRolling(false);

        onRoll?.(finalTotal);
      }
    }, frameInterval);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Roll Dice</h3>
      <div style={styles.diceContainer}>
        <div style={styles.die}>{dice1 ?? '?'}</div>
        <div style={styles.die}>{dice2 ?? '?'}</div>
      </div>
      {total !== null && (
        <div style={styles.total}>Total: {total}</div>
      )}
      <button
        style={{
          ...styles.button,
          ...(rolling ? styles.buttonDisabled : {}),
        }}
        onClick={rollDice}
        disabled={rolling}
      >
        {rolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: '#16213e',
    borderRadius: '8px',
    textAlign: 'center',
    minWidth: '200px',
  },
  title: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    color: '#eee',
  },
  diceContainer: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  die: {
    width: '60px',
    height: '60px',
    backgroundColor: '#fff',
    color: '#333',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  total: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#4ecca3',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#4ecca3',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#666',
    cursor: 'not-allowed',
  },
};
