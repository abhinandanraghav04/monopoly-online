import { BoardModel, PropertyGroup, Tile } from './types';

export function nextIndex(model: BoardModel, index: number, steps: number): number {
  const { tileCount, edges } = model.config;
  if (tileCount === 0) {
    return 0;
  }

  const normalizedIndex = ((index % tileCount) + tileCount) % tileCount;
  const normalizedSteps = ((steps % tileCount) + tileCount) % tileCount;

  let cursor = normalizedIndex;
  for (let step = 0; step < normalizedSteps; step += 1) {
    cursor = edges[cursor];
  }

  return cursor;
}

export function isCorner(model: BoardModel, index: number): boolean {
  const { tileCount, cornerIndexes } = model.config;
  if (tileCount === 0) {
    return false;
  }

  const normalizedIndex = ((index % tileCount) + tileCount) % tileCount;
  return cornerIndexes.includes(normalizedIndex);
}

export function getCornerIndexes(sideLength: number): number[] {
  const tileCount = sideLength * 4;
  const corners: number[] = [];
  for (let offset = 0; offset < tileCount; offset += sideLength) {
    corners.push(offset);
  }
  return corners;
}

export function detectPropertyGroups(tiles: Tile[]): Record<string, PropertyGroup> {
  const groups: Record<string, PropertyGroup> = {};

  tiles.forEach((tile) => {
    if (tile.kind === 'PROPERTY') {
      const { groupId } = tile;
      if (!groups[groupId]) {
        groups[groupId] = {
          id: groupId,
          label: groupId,
          color: '#000000',
          propertyIds: [],
          tileIndexes: [],
          monopolySize: 0,
        };
      }
      groups[groupId].propertyIds.push(tile.propertyId);
      groups[groupId].tileIndexes.push(tile.index);
    }
  });

  return groups;
}
