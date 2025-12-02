import { PlayerId, PropertyId, Money } from "./types";

export type RollAction = {
  type: "ROLL";
  playerId: PlayerId;
};

export type BuyAction = {
  type: "BUY";
  playerId: PlayerId;
  propertyId: PropertyId;
};

export type PassAction = {
  type: "PASS";
  playerId: PlayerId;
};

export type BuildAction = {
  type: "BUILD";
  playerId: PlayerId;
  propertyId: PropertyId;
  houses: number;
};

export type MortgageAction = {
  type: "MORTGAGE";
  playerId: PlayerId;
  propertyId: PropertyId;
};

export type UnmortgageAction = {
  type: "UNMORTGAGE";
  playerId: PlayerId;
  propertyId: PropertyId;
};

export type TradeOfferAction = {
  type: "TRADE_OFFER";
  fromPlayerId: PlayerId;
  toPlayerId: PlayerId;
  offerCash: Money;
  offerProperties: PropertyId[];
  requestCash: Money;
  requestProperties: PropertyId[];
};

export type TradeAcceptAction = {
  type: "TRADE_ACCEPT";
  playerId: PlayerId;
  tradeId: string;
};

export type EndTurnAction = {
  type: "END_TURN";
  playerId: PlayerId;
};

export type GameAction =
  | RollAction
  | BuyAction
  | PassAction
  | BuildAction
  | MortgageAction
  | UnmortgageAction
  | TradeOfferAction
  | TradeAcceptAction
  | EndTurnAction;
