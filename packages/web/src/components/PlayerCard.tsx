import React from 'react';
import type { GameState, PlayerId } from '@project/rules';
import { formatMoney, getPlayerColor, formatPlayerName, getPropertyGroupColor } from '../utils/formatting';

interface PlayerCardProps {
  gameState: GameState;
  playerId: PlayerId;
  playerIndex: number;
}

export function PlayerCard({ gameState, playerId, playerIndex }: PlayerCardProps) {
  const player = gameState.players[playerId];
  const isCurrentPlayer = gameState.currentPlayerId === playerId;
  const isBankrupt = gameState.bankruptPlayers.includes(playerId);
  const color = getPlayerColor(playerIndex);

  const playerProperties = player.properties.map((propertyId) => {
    const property = gameState.config.properties[propertyId];
    return property ? { id: propertyId, ...property } : null;
  }).filter(Boolean);

  const totalValue = player.cash + playerProperties.reduce(
    (sum, prop) => sum + (prop?.purchasePrice || 0),
    0
  );

  const status = isBankrupt
    ? 'BANKRUPT'
    : isCurrentPlayer
    ? 'PLAYING'
    : 'WAITING';

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: isCurrentPlayer
          ? `0 4px 12px ${color}80`
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
        border: isCurrentPlayer ? `3px solid ${color}` : '1px solid #e0e0e0',
        transition: 'all 0.3s ease',
        opacity: isBankrupt ? 0.6 : 1,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          {playerIndex + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            {formatPlayerName(playerId)}
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: getStatusColor(status),
              textTransform: 'uppercase',
            }}
          >
            {status}
          </div>
        </div>
      </div>

      {/* Balance */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          Cash Balance
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: player.cash < 0 ? '#f44336' : '#4CAF50',
          }}
        >
          {formatMoney(player.cash)}
        </div>
      </div>

      {/* Total Value */}
      <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          Total Value
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          {formatMoney(totalValue)}
        </div>
      </div>

      {/* Properties */}
      <div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#666',
            marginBottom: '8px',
          }}
        >
          Properties ({playerProperties.length})
        </div>
        
        {playerProperties.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
            No properties owned
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {playerProperties.slice(0, 5).map((prop) => {
              if (!prop) return null;
              const groupColor = getPropertyGroupColor(prop.group);
              
              return (
                <div
                  key={prop.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    background: '#f5f5f5',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      background: groupColor,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prop.name}
                  </div>
                </div>
              );
            })}
            
            {playerProperties.length > 5 && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center',
                  marginTop: '4px',
                }}
              >
                +{playerProperties.length - 5} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Position */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Position: <span style={{ fontWeight: 'bold', color: '#333' }}>{player.position}</span>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'PLAYING':
      return '#4CAF50';
    case 'WAITING':
      return '#2196F3';
    case 'BANKRUPT':
      return '#f44336';
    default:
      return '#999';
  }
}
