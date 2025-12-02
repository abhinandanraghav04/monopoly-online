import { PlayerId, PropertyId, Money, CardId, BoardCoord } from "./types";
import type { DiceRollResult } from "./dice";

export type MovedEvent = {
  type: "MOVED";
  playerId: PlayerId;
  from: BoardCoord;
  to: BoardCoord;
  dice: DiceRollResult;
};

export type PurchasedEvent = {
  type: "PURCHASED";
  playerId: PlayerId;
  propertyId: PropertyId;
  price: Money;
};

export type RentPaidEvent = {
  type: "RENT_PAID";
  payerId: PlayerId;
  recipientId: PlayerId;
  amount: Money;
  propertyId: PropertyId;
};

export type BuiltEvent = {
  type: "BUILT";
  playerId: PlayerId;
  propertyId: PropertyId;
  houses: number;
};

export type MortgagedEvent = {
  type: "MORTGAGED";
  playerId: PlayerId;
  propertyId: PropertyId;
};

export type BankruptEvent = {
  type: "BANKRUPT";
  playerId: PlayerId;
  owedTo?: PlayerId;
};

export type CardDrawnEvent = {
  type: "CARD_DRAWN";
  playerId: PlayerId;
  cardId: CardId;
};

export type GameEvent =
  | MovedEvent
  | PurchasedEvent
  | RentPaidEvent
  | BuiltEvent
  | MortgagedEvent
  | BankruptEvent
  | CardDrawnEvent;
