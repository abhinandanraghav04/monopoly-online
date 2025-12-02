import React, { useState, useEffect, useCallback } from 'react';
import {
  type GameState,
  type GameEvent,
  type PropertyId,
  type PlayerId,
  reduceGameState,
  createRng,
  type Rng,
} from '@project/rules';
import { Board } from '../components/Board';
import { DiceRoller } from '../components/DiceRoller';
import { PlayerCard } from '../components/PlayerCard';
import { PropertyMarket } from '../components/PropertyMarket';
import { GameLayout } from '../components/GameLayout';
import { ActionLog } from '../components/ActionLog';
import { createDemoGame, type BoardSize } from '../utils/game-demo';

export function GamePage() {
  const [gameState, setGameState] = useState<GameState>(() => createDemoGame('8x8', 4));
  const [rng, setRng] = useState<Rng>(() => createRng(Date.now()));
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [boardSize] = useState<BoardSize>('8x8');

  const sideLength = getSideLength(boardSize);

  const handleRoll = useCallback(() => {
    if (gameState.phase !== 'Roll') {
      alert('You can only roll during the Roll phase!');
      return;
    }

    setIsRolling(true);

    // Simulate rolling animation
    setTimeout(() => {
      const result = reduceGameState(
        gameState,
        { type: 'ROLL', playerId: gameState.currentPlayerId },
        rng
      );

      setGameState(result.state);
      setEvents((prev) => [...prev, ...result.events]);
      setIsRolling(false);
    }, 1000);
  }, [gameState, rng]);

  const handleBuyProperty = useCallback(
    (propertyId: PropertyId) => {
      if (gameState.phase !== 'Buy') {
        alert('You can only buy properties during the Buy phase!');
        return;
      }

      try {
        const result = reduceGameState(
          gameState,
          { type: 'BUY', playerId: gameState.currentPlayerId, propertyId },
          rng
        );

        setGameState(result.state);
        setEvents((prev) => [...prev, ...result.events]);
      } catch (error) {
        alert(`Cannot buy property: ${(error as Error).message}`);
      }
    },
    [gameState, rng]
  );

  const handlePassBuy = useCallback(() => {
    if (gameState.phase !== 'Buy') {
      return;
    }

    const result = reduceGameState(
      gameState,
      { type: 'PASS', playerId: gameState.currentPlayerId },
      rng
    );

    setGameState(result.state);
    setEvents((prev) => [...prev, ...result.events]);
  }, [gameState, rng]);

  const handleEndTurn = useCallback(() => {
    if (gameState.phase !== 'Resolve' && gameState.phase !== 'EndTurn') {
      return;
    }

    const result = reduceGameState(
      gameState,
      { type: 'END_TURN', playerId: gameState.currentPlayerId },
      rng
    );

    setGameState(result.state);
    setEvents((prev) => [...prev, ...result.events]);
  }, [gameState, rng]);

  const handleTileClick = useCallback(
    (tileIndex: number) => {
      const tile = gameState.config.board[tileIndex];
      if (!tile) return;

      if (tile.kind === 'PROPERTY') {
        const propertyId = (tile as any).propertyId;
        const owner = gameState.propertyOwnership[propertyId];

        if (owner === null && gameState.phase === 'Buy') {
          handleBuyProperty(propertyId);
        }
      }
    },
    [gameState, handleBuyProperty]
  );

  // Auto-resolve phases
  useEffect(() => {
    if (gameState.phase === 'Resolve') {
      // Automatically end turn after a short delay
      const timer = setTimeout(() => {
        handleEndTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, handleEndTurn]);

  // Placeholder handlers for property market
  const handleSellProperty = useCallback((propertyId: PropertyId) => {
    console.log('Sell property:', propertyId);
    alert('Selling properties is not yet implemented in this phase.');
  }, []);

  const handleMortgageProperty = useCallback((propertyId: PropertyId) => {
    console.log('Mortgage property:', propertyId);
    alert('Mortgaging properties is not yet implemented in this phase.');
  }, []);

  const handleTradeOffer = useCallback((propertyId: PropertyId, targetPlayerId: PlayerId) => {
    console.log('Trade offer:', propertyId, 'to', targetPlayerId);
    alert('Trading is not yet implemented in this phase.');
  }, []);

  const lastRoll = gameState.diceHistory[gameState.diceHistory.length - 1];

  return (
    <>
      <style>
        {`
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <GameLayout
        gameState={gameState}
        children={{
          board: (
            <Board
              gameState={gameState}
              sideLength={sideLength}
              onTileClick={handleTileClick}
            />
          ),
          diceRoller: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <DiceRoller
                onRoll={handleRoll}
                lastRoll={lastRoll}
                disabled={gameState.phase !== 'Roll'}
                isRolling={isRolling}
              />

              {gameState.phase === 'Buy' && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      const tile = gameState.config.board[
                        gameState.players[gameState.currentPlayerId].position
                      ];
                      if (tile && tile.kind === 'PROPERTY') {
                        handleBuyProperty((tile as any).propertyId);
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Buy Property
                  </button>
                  <button
                    onClick={handlePassBuy}
                    style={{
                      padding: '8px 16px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Pass
                  </button>
                </div>
              )}

              {gameState.phase === 'Resolve' && (
                <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                  Resolving turn...
                </div>
              )}
            </div>
          ),
          players: (
            <>
              {gameState.config.playerOrder.map((playerId, index) => (
                <PlayerCard
                  key={playerId}
                  gameState={gameState}
                  playerId={playerId}
                  playerIndex={index}
                />
              ))}
            </>
          ),
          propertyMarket: (
            <PropertyMarket
              gameState={gameState}
              currentPlayerId={gameState.currentPlayerId}
              onBuy={handleBuyProperty}
              onSell={handleSellProperty}
              onMortgage={handleMortgageProperty}
              onTradeOffer={handleTradeOffer}
            />
          ),
          actionLog: <ActionLog events={events} />,
        }}
      />
    </>
  );
}

function getSideLength(boardSize: BoardSize): number {
  switch (boardSize) {
    case '6x6':
      return 6;
    case '8x8':
      return 8;
    case '12x12':
      return 12;
    case '16x16':
      return 16;
  }
}
