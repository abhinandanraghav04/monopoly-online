import type { GameTile, PlayerId } from '@project/rules';
import { getPropertyGroupColor } from './formatting';

export interface TileLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  isCorner: boolean;
}

export interface BoardLayout {
  tiles: TileLayout[];
  boardSize: number;
  tileSize: number;
  centerX: number;
  centerY: number;
}

export function calculateBoardLayout(
  canvasWidth: number,
  canvasHeight: number,
  sideLength: number
): BoardLayout {
  const minDimension = Math.min(canvasWidth, canvasHeight);
  const boardSize = minDimension * 0.9;
  const tileSize = boardSize / sideLength;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const startX = centerX - boardSize / 2;
  const startY = centerY - boardSize / 2;

  const tiles: TileLayout[] = [];
  const totalTiles = sideLength * 4;

  for (let i = 0; i < totalTiles; i++) {
    const side = Math.floor(i / sideLength);
    const positionOnSide = i % sideLength;
    const isCorner = positionOnSide === 0;

    let x: number, y: number, width: number, height: number;

    switch (side) {
      case 0: // Bottom (left to right)
        x = startX + positionOnSide * tileSize;
        y = startY + boardSize - tileSize;
        width = tileSize;
        height = tileSize;
        break;
      case 1: // Right (bottom to top)
        x = startX + boardSize - tileSize;
        y = startY + boardSize - tileSize - positionOnSide * tileSize;
        width = tileSize;
        height = tileSize;
        break;
      case 2: // Top (right to left)
        x = startX + boardSize - tileSize - positionOnSide * tileSize;
        y = startY;
        width = tileSize;
        height = tileSize;
        break;
      case 3: // Left (top to bottom)
        x = startX;
        y = startY + positionOnSide * tileSize;
        width = tileSize;
        height = tileSize;
        break;
      default:
        x = 0;
        y = 0;
        width = tileSize;
        height = tileSize;
    }

    tiles.push({ x, y, width, height, index: i, isCorner });
  }

  return { tiles, boardSize, tileSize, centerX, centerY };
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  layout: TileLayout,
  tile: GameTile,
  isHovered: boolean,
  owner?: string
): void {
  const { x, y, width, height } = layout;

  // Background
  ctx.fillStyle = getTileColor(tile);
  ctx.fillRect(x, y, width, height);

  // Border
  ctx.strokeStyle = isHovered ? '#FFD700' : '#333';
  ctx.lineWidth = isHovered ? 3 : 1;
  ctx.strokeRect(x, y, width, height);

  // Property color bar
  if (tile.kind === 'PROPERTY') {
    const barHeight = height * 0.2;
    const groupColor = getPropertyGroupColor((tile as any).group || 'default');
    ctx.fillStyle = groupColor;
    ctx.fillRect(x, y, width, barHeight);
  }

  // Owner indicator
  if (owner) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y, width, height * 0.1);
    ctx.fillStyle = '#fff';
    ctx.font = `${height * 0.08}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(owner, x + width / 2, y + height * 0.08);
  }

  // Tile name (simplified)
  ctx.fillStyle = '#000';
  ctx.font = `${Math.min(height * 0.1, 12)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const name = tile.name;
  const maxWidth = width * 0.9;
  const words = name.split(' ');
  let line = '';
  let lineY = y + height / 2;
  
  if (layout.isCorner) {
    lineY = y + height * 0.7;
  }

  for (let i = 0; i < words.length && i < 2; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x + width / 2, lineY);
      line = words[i] + ' ';
      lineY += height * 0.12;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x + width / 2, lineY);
}

function getTileColor(tile: GameTile): string {
  switch (tile.kind) {
    case 'GO':
      return '#FF6B6B';
    case 'JAIL':
      return '#FFA500';
    case 'FREE_PARKING':
      return '#4ECDC4';
    case 'GO_TO_JAIL':
      return '#FF6347';
    case 'PROPERTY':
      return '#FAFAFA';
    case 'RAILROAD':
      return '#333';
    case 'UTILITY':
      return '#FFE66D';
    case 'CHANCE':
      return '#F8BBD0';
    case 'COMMUNITY_CHEST':
      return '#BBDEFB';
    case 'TAX':
      return '#FFCCBC';
    default:
      return '#EEE';
  }
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  layout: TileLayout,
  playerIndex: number,
  totalPlayers: number,
  color: string
): void {
  const { x, y, width, height } = layout;
  const pieceSize = Math.min(width, height) * 0.15;
  
  // Calculate position for multiple players on the same tile
  const cols = Math.ceil(Math.sqrt(totalPlayers));
  const row = Math.floor(playerIndex / cols);
  const col = playerIndex % cols;
  const spacing = width / (cols + 1);
  
  const pieceX = x + spacing * (col + 1);
  const pieceY = y + height * 0.4 + row * pieceSize * 1.2;

  // Draw player piece (circle)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pieceX, pieceY, pieceSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Player number
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${pieceSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${playerIndex + 1}`, pieceX, pieceY);
}

export function getTileAtPoint(
  x: number,
  y: number,
  layout: BoardLayout
): number | null {
  for (let i = 0; i < layout.tiles.length; i++) {
    const tile = layout.tiles[i];
    if (
      x >= tile.x &&
      x <= tile.x + tile.width &&
      y >= tile.y &&
      y <= tile.y + tile.height
    ) {
      return i;
    }
  }
  return null;
}

export function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
