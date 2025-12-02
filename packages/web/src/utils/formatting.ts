import type { Money, Turn } from '@project/rules';

export function formatMoney(amount: Money): string {
  return `$${amount.toLocaleString()}`;
}

export function formatTurn(turn: Turn): string {
  return `Turn ${turn}`;
}

export function formatPlayerName(playerId: string): string {
  return playerId.charAt(0).toUpperCase() + playerId.slice(1);
}

export function getPlayerColor(index: number): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFE66D', // Yellow
    '#95E1D3', // Mint
    '#A8E6CF', // Light Green
    '#F38181', // Pink
    '#AA96DA', // Purple
    '#FCBAD3', // Light Pink
  ];
  return colors[index % colors.length];
}

export function getPropertyGroupColor(groupId: string): string {
  const colorMap: Record<string, string> = {
    brown: '#955436',
    lightBlue: '#AADDFF',
    pink: '#FF55AA',
    orange: '#FF8833',
    red: '#EE1133',
    yellow: '#FFEE00',
    green: '#00AA44',
    darkBlue: '#0066BB',
    purple: '#AA00FF',
    skyBlue: '#55BBFF',
    cyan: '#00FFEE',
    teal: '#00AA88',
    lime: '#AAFF00',
    olive: '#888800',
    maroon: '#880000',
    navy: '#000088',
  };
  return colorMap[groupId] || '#999999';
}
