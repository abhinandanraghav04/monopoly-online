import React, { useMemo, useState } from 'react';
import { AudioManager } from '../audio/AudioManager';
import { DiceRoller } from './DiceRoller';

interface GameBoardProps {
  audioManager: AudioManager;
}

type LogEntry = {
  message: string;
  timestamp: number;
};

const TILES = [
  'GO',
  'Mediterranean Avenue',
  'Community Chest',
  'Baltic Avenue',
  'Income Tax',
  'Reading Railroad',
  'Oriental Avenue',
  'Chance',
  'Vermont Avenue',
  'Connecticut Avenue',
];

export const GameBoard: React.FC<GameBoardProps> = ({ audioManager }) => {
  const [position, setPosition] = useState(0);
  const [playerCash, setPlayerCash] = useState(1500);
  const [bankCash, setBankCash] = useState(100000);
  const [propertiesOwned, setPropertiesOwned] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [housesBuilt, setHousesBuilt] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentTile = useMemo(() => TILES[position % TILES.length], [position]);

  const addLog = (message: string) => {
    setLogs((prev) => [{ message, timestamp: Date.now() }, ...prev.slice(0, 19)]);
  };

  const handleMove = (spaces: number) => {
    if (gameFinished) {
      addLog('Game has ended. Restart to play again.');
      return;
    }

    setPosition((prev) => {
      const newPosition = (prev + spaces) % TILES.length;
      audioManager.playMove();
      addLog(`Player moves ${spaces} spaces to ${TILES[newPosition]}.`);
      return newPosition;
    });
  };

  const handlePropertyPurchase = () => {
    if (gameFinished) return;

    const cost = 200;
    if (playerCash < cost) {
      addLog('Not enough cash to purchase property.');
      return;
    }

    setPlayerCash((prev) => prev - cost);
    setPropertiesOwned((prev) => [...prev, currentTile]);
    audioManager.playPropertyPurchase();
    addLog(`Purchased ${currentTile} for $${cost}.`);
  };

  const handleRentPayment = () => {
    if (gameFinished) return;

    const rent = 50;
    setPlayerCash((prev) => prev - rent);
    setBankCash((prev) => prev + rent);
    audioManager.playRentPayment();
    addLog(`Paid $${rent} in rent.`);
  };

  const handlePropertyUpgrade = () => {
    if (gameFinished) return;

    const pricePerHouse = 100;
    if (playerCash < pricePerHouse) {
      addLog('Not enough cash to build a house.');
      return;
    }

    setPlayerCash((prev) => prev - pricePerHouse);
    setHousesBuilt((prev) => prev + 1);
    audioManager.playPropertyUpgrade();
    addLog('Built a house to increase property rent.');
  };

  const handleMoneyTransaction = () => {
    if (gameFinished) return;

    const amount = 150;
    setPlayerCash((prev) => prev + amount);
    setBankCash((prev) => prev - amount);
    audioManager.playMoneyTransaction();
    addLog(`Received $${amount} from the bank.`);
  };

  const handleGameOver = (won: boolean) => {
    if (gameFinished) return;

    audioManager.playGameOver(won);
    audioManager.stopBackgroundMusic();
    setGameFinished(true);
    addLog(`Game over. You ${won ? 'won! 🎉' : 'lost. 😢'}`);
  };

  const handleDiceRoll = (value: number) => {
    handleMove(value);
  };

  const resetGame = () => {
    setPosition(0);
    setPlayerCash(1500);
    setBankCash(100000);
    setPropertiesOwned([]);
    setLogs([]);
    setHousesBuilt(0);
    setGameFinished(false);
    addLog('Game reset. Good luck!');
    audioManager.playBackgroundMusic();
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.boardSection}>
        <div style={styles.statusCard}>
          <h2 style={styles.sectionTitle}>Player Status</h2>
          <p style={styles.statusText}>Current Tile: <strong>{currentTile}</strong></p>
          <p style={styles.statusText}>Player Cash: <strong>${playerCash}</strong></p>
          <p style={styles.statusText}>Bank Cash: <strong>${bankCash}</strong></p>
          <p style={styles.statusText}>Houses Built: <strong>{housesBuilt}</strong></p>
          <p style={styles.statusText}>Properties Owned: <strong>{propertiesOwned.length}</strong></p>
          {gameFinished && (
            <p style={{ ...styles.statusText, color: '#ffcc00' }}>
              Game finished! Reset to play again.
            </p>
          )}
        </div>

        <div style={styles.actionsCard}>
          <h2 style={styles.sectionTitle}>Actions</h2>
          <button style={styles.actionButton} onClick={handlePropertyPurchase}>
            Buy Property
          </button>
          <button style={styles.actionButton} onClick={handleRentPayment}>
            Pay Rent
          </button>
          <button style={styles.actionButton} onClick={handlePropertyUpgrade}>
            Build House
          </button>
          <button style={styles.actionButton} onClick={handleMoneyTransaction}>
            Bank Payout
          </button>
          <div style={styles.gameOverButtons}>
            <button
              style={{ ...styles.actionButton, backgroundColor: '#4caf50' }}
              onClick={() => handleGameOver(true)}
            >
              Win Game
            </button>
            <button
              style={{ ...styles.actionButton, backgroundColor: '#f44336' }}
              onClick={() => handleGameOver(false)}
            >
              Lose Game
            </button>
          </div>
          <button style={styles.resetButton} onClick={resetGame}>
            Reset Game
          </button>
        </div>
      </div>

      <div style={styles.diceAndLog}>
        <DiceRoller audioManager={audioManager} onRoll={handleDiceRoll} />

        <div style={styles.logCard}>
          <h2 style={styles.sectionTitle}>Game Log</h2>
          <div style={styles.logList}>
            {logs.length === 0 && (
              <p style={styles.statusText}>No actions yet.</p>
            )}
            {logs.map((entry) => (
              <div key={entry.timestamp} style={styles.logEntry}>
                <span style={styles.logTimestamp}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span>{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  boardSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    flex: 1,
    minWidth: '300px',
  },
  statusCard: {
    backgroundColor: '#0f3460',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  actionsCard: {
    backgroundColor: '#0f3460',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  diceAndLog: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    flex: 1,
    minWidth: '280px',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    fontSize: '20px',
    color: '#4ecca3',
  },
  statusText: {
    margin: '6px 0',
    fontSize: '16px',
  },
  actionButton: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#4ecca3',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
  },
  gameOverButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  resetButton: {
    marginTop: '10px',
    padding: '10px',
    fontSize: '14px',
    backgroundColor: '#1a1a2e',
    color: '#4ecca3',
    border: '1px solid #4ecca3',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  logCard: {
    backgroundColor: '#0f3460',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    flex: 1,
  },
  logList: {
    maxHeight: '260px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  logEntry: {
    padding: '10px',
    backgroundColor: '#16213e',
    borderRadius: '6px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '14px',
  },
  logTimestamp: {
    fontSize: '12px',
    color: '#aaa',
  },
};
