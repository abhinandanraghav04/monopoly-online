export type GameId = string;
export type PlayerId = string;
export type PropertyId = string;
export type CardId = string;
export type BoardCoord = number;
export type Turn = number;
export type Money = number;

export type Phase =
  | "Roll"
  | "Move"
  | "Buy"
  | "Build"
  | "Trade"
  | "Resolve"
  | "EndTurn";
