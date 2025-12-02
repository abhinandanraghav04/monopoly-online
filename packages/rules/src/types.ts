export type TileKind =
  | 'GO'
  | 'PROPERTY'
  | 'RAILROAD'
  | 'UTILITY'
  | 'CHANCE'
  | 'COMMUNITY_CHEST'
  | 'TAX'
  | 'JAIL'
  | 'FREE_PARKING'
  | 'GO_TO_JAIL';

export interface PropertyRentTable {
  base: number;
  houses: [number, number, number, number];
  hotel: number;
}

export interface PropertyEconomy {
  id: string;
  groupId: string;
  price: number;
  rent: PropertyRentTable;
  houseCost: number;
  hotelCost: number;
  mortgageValue: number;
}

export interface PropertyGroupDefinition {
  id: string;
  label: string;
  color: string;
  propertyCount: number;
}

export interface BoardEconomyPreset {
  key: string;
  label: string;
  startingCash: number;
  goSalary: number;
  baseRentRate: number;
  houseRentMultipliers: [number, number, number, number];
  hotelRentMultiplier: number;
  houseCostRate: number;
  hotelCostRate: number;
  mortgageRate: number;
}

export interface BoardEconomy {
  key: string;
  label: string;
  startingCash: number;
  goSalary: number;
  preset: BoardEconomyPreset;
  propertyGroups: Record<string, PropertyGroupDefinition>;
  properties: Record<string, PropertyEconomy>;
}

export interface BaseTile {
  index: number;
  id: string;
  name: string;
  kind: TileKind;
}

export interface PropertyTile extends BaseTile {
  kind: 'PROPERTY';
  propertyId: string;
  groupId: string;
  price: number;
  rent: PropertyRentTable;
  houseCost: number;
  hotelCost: number;
  mortgageValue: number;
}

export interface TaxTile extends BaseTile {
  kind: 'TAX';
  amount: number;
}

export interface GoToJailTile extends BaseTile {
  kind: 'GO_TO_JAIL';
  targetId: string;
  targetIndex?: number;
}

export interface SimpleTile extends BaseTile {
  kind:
    | 'GO'
    | 'RAILROAD'
    | 'UTILITY'
    | 'CHANCE'
    | 'COMMUNITY_CHEST'
    | 'JAIL'
    | 'FREE_PARKING';
}

export type Tile = PropertyTile | TaxTile | GoToJailTile | SimpleTile;

export interface PropertyGroup {
  id: string;
  label: string;
  color: string;
  propertyIds: string[];
  tileIndexes: number[];
  monopolySize: number;
}

export interface BoardConfig {
  key: string;
  label: string;
  sideLength: number;
  tileCount: number;
  tiles: Tile[];
  edges: number[];
  startTileIndex: number;
  cornerIndexes: number[];
}

export interface BoardModel {
  key: string;
  label: string;
  config: BoardConfig;
  economy: BoardEconomy;
  groups: Record<string, PropertyGroup>;
}
