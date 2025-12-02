import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { GameState, GameTile, PlayerId } from '@project/rules';
import {
  calculateBoardLayout,
  drawTile,
  drawPlayer,
  getTileAtPoint,
  type BoardLayout,
} from '../utils/canvas-helpers';
import { getPlayerColor, formatMoney, formatPlayerName } from '../utils/formatting';

interface BoardProps {
  gameState: GameState;
  sideLength: number;
  onTileClick?: (tileIndex: number) => void;
}

type TooltipInfo =
  | {
      kind: 'property';
      name: string;
      owner: string;
      price: string;
      rent: string;
    }
  | {
      kind: 'tile';
      name: string;
      type: GameTile['kind'];
    };

export function Board({ gameState, sideLength, onTileClick }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const pointerDownRef = useRef(false);
  const panActiveRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });

  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const [boardLayout, setBoardLayout] = useState<BoardLayout | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Responsive canvas sizing
  useEffect(() => {
    const updateDimensions = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 800;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Compute tile layout whenever dimensions or board size changes
  useEffect(() => {
    setBoardLayout(calculateBoardLayout(dimensions.width, dimensions.height, sideLength));
  }, [dimensions, sideLength]);

  // Ensure panning stops if the mouse is released outside the canvas
  useEffect(() => {
    const handlePointerRelease = () => {
      pointerDownRef.current = false;
      if (panActiveRef.current) {
        panActiveRef.current = false;
        setIsPanning(false);
      }
    };

    window.addEventListener('mouseup', handlePointerRelease);
    window.addEventListener('mouseleave', handlePointerRelease);
    return () => {
      window.removeEventListener('mouseup', handlePointerRelease);
      window.removeEventListener('mouseleave', handlePointerRelease);
    };
  }, []);

  // Continuous canvas rendering loop (targeting 60fps)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !boardLayout) {
      return;
    }

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const desiredWidth = Math.floor(dimensions.width * dpr);
      const desiredHeight = Math.floor(dimensions.height * dpr);

      if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
        canvas.width = desiredWidth;
        canvas.height = desiredHeight;
        canvas.style.width = `${dimensions.width}px`;
        canvas.style.height = `${dimensions.height}px`;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Inner board background
      ctx.fillStyle = '#E8F5E9';
      const centerSize = boardLayout.boardSize - boardLayout.tileSize * 2;
      const centerX = boardLayout.centerX - centerSize / 2;
      const centerY = boardLayout.centerY - centerSize / 2;
      ctx.fillRect(centerX, centerY, centerSize, centerSize);

      // Board title
      ctx.fillStyle = '#2E7D32';
      ctx.font = 'bold 48px "Montserrat", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MONOPOLY', boardLayout.centerX, boardLayout.centerY);

      // Tiles
      const tiles = gameState.config.board;
      tiles.forEach((tile, index) => {
        const layout = boardLayout.tiles[index];
        if (!layout) {
          return;
        }

        let ownerLabel: string | undefined;
        if (tile.kind === 'PROPERTY') {
          const ownerId = gameState.propertyOwnership[tile.propertyId];
          ownerLabel = ownerId ? formatPlayerName(ownerId) : undefined;
        }

        drawTile(ctx, layout, tile, hoveredTile === index, ownerLabel);
      });

      // Player tokens
      const playersByPosition = new Map<number, PlayerId[]>();
      Object.values(gameState.players).forEach((player) => {
        const existing = playersByPosition.get(player.position) ?? [];
        existing.push(player.id);
        playersByPosition.set(player.position, existing);
      });

      playersByPosition.forEach((playerIds, position) => {
        const layout = boardLayout.tiles[position];
        if (!layout) {
          return;
        }

        playerIds.forEach((playerId, index) => {
          const playerOrderIndex = gameState.config.playerOrder.indexOf(playerId);
          const color = getPlayerColor(playerOrderIndex);
          drawPlayer(ctx, layout, index, playerIds.length, color);
        });
      });

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [boardLayout, dimensions, gameState, hoveredTile, pan, zoom]);

  const toBoardCoordinates = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return null;
      }
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - pan.x) / zoom;
      const y = (event.clientY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (event.button !== 0) {
        return;
      }
      pointerDownRef.current = true;
      panActiveRef.current = false;
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      panOriginRef.current = { ...pan };
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!boardLayout) {
        return;
      }

      if (pointerDownRef.current) {
        const dx = event.clientX - pointerStartRef.current.x;
        const dy = event.clientY - pointerStartRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!panActiveRef.current && distance > 6) {
          panActiveRef.current = true;
          setIsPanning(true);
        }

        if (panActiveRef.current) {
          event.preventDefault();
          setPan({
            x: panOriginRef.current.x + dx,
            y: panOriginRef.current.y + dy,
          });
          setHoveredTile(null);
          return;
        }
      }

      const boardPoint = toBoardCoordinates(event);
      if (!boardPoint) {
        return;
      }

      const tileIndex = getTileAtPoint(boardPoint.x, boardPoint.y, boardLayout);
      setHoveredTile(tileIndex);
    },
    [boardLayout, toBoardCoordinates]
  );

  const handleMouseUp = useCallback(() => {
    pointerDownRef.current = false;
    if (panActiveRef.current) {
      panActiveRef.current = false;
      setIsPanning(false);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredTile(null);
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;

    setZoom((previous) => {
      const nextZoom = Math.max(0.5, Math.min(3, previous * zoomFactor));
      if (nextZoom === previous) {
        return previous;
      }

      const zoomRatio = nextZoom / previous;
      setPan((prevPan) => ({
        x: mouseX - (mouseX - prevPan.x) * zoomRatio,
        y: mouseY - (mouseY - prevPan.y) * zoomRatio,
      }));

      return nextZoom;
    });
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!boardLayout || !onTileClick || panActiveRef.current) {
        return;
      }

      const boardPoint = toBoardCoordinates(event);
      if (!boardPoint) {
        return;
      }

      const tileIndex = getTileAtPoint(boardPoint.x, boardPoint.y, boardLayout);
      if (tileIndex !== null) {
        onTileClick(tileIndex);
      }
    },
    [boardLayout, onTileClick, toBoardCoordinates]
  );

  const hoveredTileInfo = useMemo<TooltipInfo | null>(() => {
    if (hoveredTile === null) {
      return null;
    }
    const tile = gameState.config.board[hoveredTile];
    if (!tile) {
      return null;
    }

    if (tile.kind === 'PROPERTY') {
      const property = gameState.config.properties[tile.propertyId];
      const ownerId = gameState.propertyOwnership[tile.propertyId];
      return {
        kind: 'property',
        name: tile.name,
        owner: ownerId ? formatPlayerName(ownerId) : 'Available',
        price: property ? formatMoney(property.purchasePrice) : 'N/A',
        rent: property ? formatMoney(property.baseRent) : 'N/A',
      };
    }

    return {
      kind: 'tile',
      name: tile.name,
      type: tile.kind,
    };
  }, [gameState, hoveredTile]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onClick={handleClick}
        onContextMenu={(event) => event.preventDefault()}
        style={{
          border: '2px solid #333',
          display: 'block',
          background: '#ffffff',
          cursor: isPanning ? 'grabbing' : hoveredTile !== null ? 'pointer' : 'grab',
          borderRadius: '12px',
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.15)',
        }}
      />

      {hoveredTileInfo && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            lineHeight: 1.4,
            pointerEvents: 'none',
            maxWidth: '260px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{hoveredTileInfo.name}</div>
          {hoveredTileInfo.kind === 'property' ? (
            <>
              <div>Owner: {hoveredTileInfo.owner}</div>
              <div>Purchase: {hoveredTileInfo.price}</div>
              <div>Rent: {hoveredTileInfo.rent}</div>
            </>
          ) : (
            <div>Type: {hoveredTileInfo.type}</div>
          )}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          display: 'flex',
          gap: '8px',
          padding: '8px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <button
          type="button"
          onClick={() => setZoom((value) => Math.min(3, value * 1.2))}
          style={zoomButtonStyle('#4CAF50')}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          style={zoomButtonStyle('#2196F3')}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setZoom((value) => Math.max(0.5, value * 0.8))}
          style={zoomButtonStyle('#f44336')}
        >
          -
        </button>
      </div>
    </div>
  );
}

const zoomButtonStyle = (color: string): React.CSSProperties => ({
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  border: 'none',
  background: color,
  color: 'white',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
});
