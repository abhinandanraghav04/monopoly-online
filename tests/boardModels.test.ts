import { describe, it, expect } from 'vitest';

import {
  QUICK_6x6,
  CLASSIC_8x8,
  EXTENDED_12x12,
  MEGA_16x16,
  nextIndex,
  isCorner,
} from '../packages/rules/src/index';

const models = [
  { key: 'QUICK_6x6', model: QUICK_6x6, sideLength: 6 },
  { key: 'CLASSIC_8x8', model: CLASSIC_8x8, sideLength: 8 },
  { key: 'EXTENDED_12x12', model: EXTENDED_12x12, sideLength: 12 },
  { key: 'MEGA_16x16', model: MEGA_16x16, sideLength: 16 },
];

describe('Board models', () => {
  models.forEach(({ key, model, sideLength }) => {
    describe(`${key}`, () => {
      it('has consistent tile count and side length', () => {
        const expectedCount = sideLength * 4;
        expect(model.config.tileCount).toBe(expectedCount);
        expect(model.config.sideLength).toBe(sideLength);
        expect(model.config.tiles).toHaveLength(expectedCount);
        expect(model.config.edges).toHaveLength(expectedCount);
      });

      it('has valid edges (clockwise loop)', () => {
        const { edges } = model.config;
        const visited = new Set<number>();
        let index = model.config.startTileIndex;
        for (let step = 0; step < model.config.tileCount; step += 1) {
          expect(visited.has(index)).toBe(false);
          visited.add(index);
          index = edges[index];
        }
        expect(index).toBe(model.config.startTileIndex);
        expect(visited.size).toBe(model.config.tileCount);
      });

      it('identifies corners correctly', () => {
        const { cornerIndexes } = model.config;
        expect(cornerIndexes).toHaveLength(4);

        model.config.tiles.forEach((tile, index) => {
          if (cornerIndexes.includes(index)) {
            expect(isCorner(model, index)).toBe(true);
          } else {
            expect(isCorner(model, index)).toBe(false);
          }
        });
      });

      it('nextIndex wraps correctly around the board', () => {
        const { tileCount, edges } = model.config;
        for (let i = 0; i < tileCount; i += 1) {
          expect(nextIndex(model, i, 0)).toBe(i);
          expect(nextIndex(model, i, tileCount)).toBe(i);
          expect(nextIndex(model, i, tileCount + 3)).toBe(edges[edges[edges[i]]]);
        }
      });

      it('has consistent monopoly group definitions', () => {
        const groupCounts: Record<string, number> = {};
        model.config.tiles.forEach((tile) => {
          if (tile.kind === 'PROPERTY') {
            groupCounts[tile.groupId] = (groupCounts[tile.groupId] || 0) + 1;
            expect(tile.rent).toBeDefined();
            expect(tile.rent.base).toBeGreaterThan(0);
            expect(tile.price).toBeGreaterThan(0);
          }
        });

        Object.entries(model.groups).forEach(([groupId, group]) => {
          expect(groupCounts[groupId]).toBe(group.monopolySize);
          expect(group.propertyIds).toHaveLength(group.monopolySize);
          expect(group.tileIndexes).toHaveLength(group.monopolySize);
        });

        Object.entries(model.economy.propertyGroups).forEach(([groupId, definition]) => {
          expect(groupCounts[groupId]).toBe(definition.propertyCount);
        });
      });

      it('contains rent tables for each property', () => {
        model.config.tiles.forEach((tile) => {
          if (tile.kind === 'PROPERTY') {
            expect(tile.rent).toBeDefined();
            expect(tile.rent.base).toBeGreaterThan(0);
            expect(tile.rent.houses).toHaveLength(4);
            expect(tile.rent.hotel).toBeGreaterThan(0);
            expect(tile.price).toBeGreaterThan(0);
            expect(tile.houseCost).toBeGreaterThanOrEqual(0);
            expect(tile.hotelCost).toBeGreaterThanOrEqual(0);
            expect(tile.mortgageValue).toBeGreaterThan(0);
          }
        });
      });

      it('has special tiles (GO, Jail, etc.)', () => {
        const hasGo = model.config.tiles.some(tile => tile.kind === 'GO');
        const hasJail = model.config.tiles.some(tile => tile.kind === 'JAIL');
        const hasFreeParking = model.config.tiles.some(tile => tile.kind === 'FREE_PARKING');
        const hasGoToJail = model.config.tiles.some(tile => tile.kind === 'GO_TO_JAIL');

        expect(hasGo).toBe(true);
        expect(hasJail).toBe(true);
        expect(hasFreeParking).toBe(true);
        expect(hasGoToJail).toBe(true);
      });

      it('validates go-to-jail target', () => {
        const goToJailTile = model.config.tiles.find(tile => tile.kind === 'GO_TO_JAIL');
        if (goToJailTile && goToJailTile.kind === 'GO_TO_JAIL') {
          expect(goToJailTile.targetIndex).toBeDefined();
          const targetTile = model.config.tiles[goToJailTile.targetIndex!];
          expect(targetTile).toBeDefined();
          expect(targetTile.kind).toBe('JAIL');
        }
      });
    });
  });
});
