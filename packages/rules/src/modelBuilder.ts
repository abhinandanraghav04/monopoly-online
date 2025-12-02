import {
  BoardConfig,
  BoardEconomy,
  BoardModel,
  GoToJailTile,
  PropertyTile,
  SimpleTile,
  TaxTile,
  Tile,
} from './types';
import { detectPropertyGroups, getCornerIndexes } from './boardHelpers';

const TITLE_CASE_REGEX = /(^|[-_\s])(\w)/g;

function toTitle(value: string): string {
  return value.replace(TITLE_CASE_REGEX, (_, prefix, char) => `${prefix === '_' || prefix === '-' ? ' ' : prefix}${char.toUpperCase()}`);
}

type SimpleKind = SimpleTile['kind'];

export type TileBlueprint =
  | { type: 'PROPERTY'; propertyId: string; id?: string; name?: string }
  | { type: SimpleKind; id?: string; name?: string }
  | { type: 'TAX'; amount: number; id?: string; name?: string }
  | { type: 'GO_TO_JAIL'; targetId?: string; id?: string; name?: string };

export interface BoardDefinition {
  key: string;
  label: string;
  sideLength: number;
  economy: BoardEconomy;
  layout: TileBlueprint[];
}

function createPropertyTile(index: number, blueprint: Extract<TileBlueprint, { type: 'PROPERTY' }>, economy: BoardEconomy): PropertyTile {
  const property = economy.properties[blueprint.propertyId];
  if (!property) {
    throw new Error(`Missing economy data for property: ${blueprint.propertyId}`);
  }

  const id = blueprint.id ?? blueprint.propertyId;
  const name = blueprint.name ?? toTitle(blueprint.propertyId);

  return {
    index,
    id,
    name,
    kind: 'PROPERTY',
    propertyId: property.id,
    groupId: property.groupId,
    price: property.price,
    rent: property.rent,
    houseCost: property.houseCost,
    hotelCost: property.hotelCost,
    mortgageValue: property.mortgageValue,
  };
}

function createSimpleTile(index: number, blueprint: Extract<TileBlueprint, { type: SimpleKind }>): SimpleTile {
  const defaultNames: Record<SimpleKind, string> = {
    GO: 'GO',
    JAIL: 'Jail / Just Visiting',
    FREE_PARKING: 'Free Parking',
    RAILROAD: 'Railroad',
    UTILITY: 'Utility',
    CHANCE: 'Chance',
    COMMUNITY_CHEST: 'Community Chest',
  };

  const defaultIds: Partial<Record<SimpleKind, string>> = {
    GO: 'go',
    JAIL: 'jail',
    FREE_PARKING: 'free-parking',
  };

  const id = blueprint.id ?? defaultIds[blueprint.type] ?? `tile-${index}`;
  const name = blueprint.name ?? defaultNames[blueprint.type] ?? toTitle(blueprint.type.toLowerCase());

  return {
    index,
    id,
    name,
    kind: blueprint.type,
  };
}

function createTaxTile(index: number, blueprint: Extract<TileBlueprint, { type: 'TAX' }>): TaxTile {
  const id = blueprint.id ?? `tax-${index}`;
  const name = blueprint.name ?? 'Tax';
  return {
    index,
    id,
    name,
    kind: 'TAX',
    amount: blueprint.amount,
  };
}

function createGoToJailTile(index: number, blueprint: Extract<TileBlueprint, { type: 'GO_TO_JAIL' }>): GoToJailTile {
  const id = blueprint.id ?? 'go-to-jail';
  const name = blueprint.name ?? 'Go To Jail';
  const targetId = blueprint.targetId ?? 'jail';
  return {
    index,
    id,
    name,
    kind: 'GO_TO_JAIL',
    targetId,
  };
}

function normalizeLayout(definition: BoardDefinition): Tile[] {
  const tiles: Tile[] = definition.layout.map((blueprint, index) => {
    switch (blueprint.type) {
      case 'PROPERTY':
        return createPropertyTile(index, blueprint, definition.economy);
      case 'TAX':
        return createTaxTile(index, blueprint);
      case 'GO_TO_JAIL':
        return createGoToJailTile(index, blueprint);
      default:
        return createSimpleTile(index, blueprint);
    }
  });

  const idSet = new Set<string>();
  tiles.forEach((tile) => {
    if (idSet.has(tile.id)) {
      throw new Error(`Duplicate tile id detected: ${tile.id}`);
    }
    idSet.add(tile.id);
  });

  tiles.forEach((tile) => {
    if (tile.kind === 'GO_TO_JAIL') {
      const targetIndex = tiles.findIndex((target) => target.id === tile.targetId);
      if (targetIndex === -1) {
        throw new Error(`Go To Jail tile targets unknown tile id: ${tile.targetId}`);
      }
      tile.targetIndex = targetIndex;
    }
  });

  return tiles;
}

function assignGroupMetadata(model: BoardModel): void {
  Object.entries(model.groups).forEach(([groupId, group]) => {
    const definition = model.economy.propertyGroups[groupId];
    if (!definition) {
      throw new Error(`Property group not defined in economy: ${groupId}`);
    }
    if (group.propertyIds.length !== definition.propertyCount) {
      throw new Error(
        `Property group ${groupId} expected ${definition.propertyCount} properties but found ${group.propertyIds.length}`,
      );
    }
    group.label = definition.label;
    group.color = definition.color;
    group.monopolySize = definition.propertyCount;
  });
}

export function buildBoardModel(definition: BoardDefinition): BoardModel {
  const tileCount = definition.sideLength * 4;
  if (definition.layout.length !== tileCount) {
    throw new Error(
      `Board ${definition.key} layout length ${definition.layout.length} does not match expected tile count ${tileCount}.`,
    );
  }

  const tiles = normalizeLayout(definition);
  const edges = tiles.map((_, index) => (index + 1) % tileCount);
  const cornerIndexes = getCornerIndexes(definition.sideLength);
  const startTileIndex = tiles.find((tile) => tile.kind === 'GO')?.index ?? 0;

  const config: BoardConfig = {
    key: definition.key,
    label: definition.label,
    sideLength: definition.sideLength,
    tileCount,
    tiles,
    edges,
    startTileIndex,
    cornerIndexes,
  };

  const groups = detectPropertyGroups(tiles);

  const model: BoardModel = {
    key: definition.key,
    label: definition.label,
    config,
    economy: definition.economy,
    groups,
  };

  assignGroupMetadata(model);

  return model;
}
