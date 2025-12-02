import { BoardCoord, Money, PlayerId, PropertyId } from "./types";

export interface Property {
  id: PropertyId;
  name: string;
  purchasePrice: Money;
  baseRent: Money;
  rentWithHouses?: Money[];
  houseCost?: Money;
  group: string;
  type: "PROPERTY" | "UTILITY" | "RAILROAD";
}

export type GoTile = {
  kind: "GO";
  name: string;
  payout: Money;
};

export type PropertyTile = {
  kind: "PROPERTY";
  name: string;
  propertyId: PropertyId;
  group: string;
};

export type ChanceTile = {
  kind: "CHANCE";
  name: string;
};

export type CommunityChestTile = {
  kind: "COMMUNITY_CHEST";
  name: string;
};

export type JailTile = {
  kind: "JAIL";
  name: string;
};

export type GoToJailTile = {
  kind: "GO_TO_JAIL";
  name: string;
};

export type TaxTile = {
  kind: "TAX";
  name: string;
  amount: Money;
};

export type FreeParkingTile = {
  kind: "FREE_PARKING";
  name: string;
};

export type UtilityTile = {
  kind: "UTILITY";
  name: string;
  propertyId: PropertyId;
};

export type RailroadTile = {
  kind: "RAILROAD";
  name: string;
  propertyId: PropertyId;
};

export type GameTile =
  | GoTile
  | PropertyTile
  | ChanceTile
  | CommunityChestTile
  | JailTile
  | GoToJailTile
  | TaxTile
  | FreeParkingTile
  | UtilityTile
  | RailroadTile;

export interface PlayerState {
  id: PlayerId;
  cash: Money;
  position: BoardCoord;
  properties: PropertyId[];
  houses: Record<PropertyId, number>;
  jailed: boolean;
  getOutOfJailCards: number;
}

export const OWNABLE_TILE_KINDS: GameTile["kind"][] = [
  "PROPERTY",
  "UTILITY",
  "RAILROAD"
];

export function isOwnableTile(
  tile: GameTile
): tile is PropertyTile | UtilityTile | RailroadTile {
  return OWNABLE_TILE_KINDS.includes(tile.kind);
}
