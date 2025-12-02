import React, { useEffect, useRef } from 'react';
import type { GameEvent } from '@project/rules';
import { formatMoney, formatPlayerName } from '../utils/formatting';

interface ActionLogProps {
  events: GameEvent[];
}

export function ActionLog({ events }: ActionLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#fafafa',
        borderRadius: '12px',
        padding: '16px',
        height: '100%',
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
        Action Log
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {events.length === 0 ? (
          <div style={{ fontSize: '14px', color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
            No actions yet. Roll the dice to start!
          </div>
        ) : (
          events.map((event, index) => (
            <EventItem key={index} event={event} index={index} />
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

interface EventItemProps {
  event: GameEvent;
  index: number;
}

function EventItem({ event, index }: EventItemProps) {
  const { icon, message, color } = formatEvent(event);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'start',
        gap: '12px',
        padding: '10px 12px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: '20px', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>
          #{index + 1}
        </div>
        <div style={{ fontSize: '14px', color: '#333' }}>{message}</div>
      </div>
    </div>
  );
}

function formatEvent(event: GameEvent): { icon: string; message: string; color: string } {
  switch (event.type) {
    case 'MOVED':
      return {
        icon: '🎲',
        message: `${formatPlayerName(event.playerId)} rolled ${event.dice.die1} + ${event.dice.die2} = ${event.dice.total} and moved from ${event.from} to ${event.to}`,
        color: '#2196F3',
      };

    case 'PURCHASED':
      return {
        icon: '🏠',
        message: `${formatPlayerName(event.playerId)} purchased a property for ${formatMoney(event.price)}`,
        color: '#4CAF50',
      };

    case 'RENT_PAID':
      return {
        icon: '💰',
        message: `${formatPlayerName(event.payerId)} paid ${formatMoney(event.amount)} rent to ${formatPlayerName(event.recipientId)}`,
        color: '#FF9800',
      };

    case 'BANKRUPT':
      return {
        icon: '💸',
        message: `${formatPlayerName(event.playerId)} went bankrupt (owed to ${formatPlayerName(event.owedTo)})`,
        color: '#f44336',
      };

    case 'BUILT':
      return {
        icon: '🏗️',
        message: `${formatPlayerName(event.playerId)} built ${event.houses} house(s) on property`,
        color: '#9C27B0',
      };

    case 'MORTGAGED':
      return {
        icon: '🏦',
        message: `${formatPlayerName(event.playerId)} mortgaged a property`,
        color: '#795548',
      };

    case 'CARD_DRAWN':
      return {
        icon: '🃏',
        message: `${formatPlayerName(event.playerId)} drew a card`,
        color: '#00BCD4',
      };

    default:
      return {
        icon: '📋',
        message: 'Unknown event',
        color: '#999',
      };
  }
}
