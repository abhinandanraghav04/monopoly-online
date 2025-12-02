import React from 'react';
import type { GameState } from '@project/rules';
import { formatTurn, formatPlayerName } from '../utils/formatting';

interface GameLayoutProps {
  gameState: GameState;
  headerActions?: React.ReactNode;
  children: {
    board: React.ReactNode;
    diceRoller: React.ReactNode;
    players: React.ReactNode;
    propertyMarket: React.ReactNode;
    actionLog: React.ReactNode;
  };
}

export function GameLayout({ gameState, headerActions, children }: GameLayoutProps) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateAreas: `
          "header header header"
          "sidebar-left board sidebar-right"
          "sidebar-left board sidebar-right"
        `,
        background: '#f5f5f5',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          gridArea: 'header',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px 24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: headerActions ? '1fr auto auto' : '1fr auto',
            alignItems: 'center',
            gap: '24px',
            width: '100%',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
              🎲 Monopoly
            </h1>
            <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>
              {formatTurn(gameState.turn)} • Phase: {gameState.phase}
            </div>
          </div>

          {headerActions && (
            <div style={{ justifySelf: 'center' }}>{headerActions}</div>
          )}

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Current Player</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {formatPlayerName(gameState.currentPlayerId)}
            </div>
          </div>
        </div>
      </div>

      {/* Left Sidebar - Player List */}
      <div
        style={{
          gridArea: 'sidebar-left',
          background: '#fff',
          borderRight: '1px solid #e0e0e0',
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            paddingBottom: '8px',
            borderBottom: '2px solid #667eea',
          }}
        >
          Players
        </div>
        {children.players}
      </div>

      {/* Center - Board */}
      <div
        style={{
          gridArea: 'board',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflow: 'auto',
        }}
      >
        <div style={{ flex: 1, minHeight: 0, background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
          {children.board}
        </div>

        {/* Bottom Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '16px',
            background: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <InfoBox label="Players" value={gameState.config.playerOrder.length} />
            <InfoBox label="Properties" value={Object.keys(gameState.config.properties).length} />
            <InfoBox
              label="Bankrupts"
              value={gameState.bankruptPlayers.length}
              color={gameState.bankruptPlayers.length > 0 ? '#f44336' : undefined}
            />
          </div>

          <div>{children.diceRoller}</div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        style={{
          gridArea: 'sidebar-right',
          background: '#fff',
          borderLeft: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
        }}
      >
        {/* Property Market */}
        <div style={{ borderBottom: '1px solid #e0e0e0' }}>
          {children.propertyMarket}
        </div>

        {/* Action Log */}
        <div style={{ flex: 1, padding: '16px' }}>{children.actionLog}</div>
      </div>
    </div>
  );
}

interface InfoBoxProps {
  label: string;
  value: number | string;
  color?: string;
}

function InfoBox({ label, value, color = '#333' }: InfoBoxProps) {
  return (
    <div style={{ padding: '8px 16px' }}>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}
