import { buildEconomy } from '../economy/factory';
import { QUICK_PRESET } from '../economy/presets';
import { buildBoardModel, TileBlueprint } from '../modelBuilder';

const economy = buildEconomy({
  key: 'quick-6x6',
  label: 'Quick 6x6',
  preset: QUICK_PRESET,
  propertyGroups: [
    { id: 'brown', label: 'Brown', color: '#8B4513', propertyCount: 2 },
    { id: 'lightblue', label: 'Light Blue', color: '#87CEEB', propertyCount: 2 },
    { id: 'purple', label: 'Purple', color: '#8B008B', propertyCount: 2 },
    { id: 'orange', label: 'Orange', color: '#FFA500', propertyCount: 2 },
    { id: 'red', label: 'Red', color: '#FF0000', propertyCount: 2 },
    { id: 'yellow', label: 'Yellow', color: '#FFFF00', propertyCount: 2 },
  ],
  properties: [
    { id: 'mediterranean-avenue', groupId: 'brown', price: 60 },
    { id: 'baltic-avenue', groupId: 'brown', price: 60 },
    { id: 'oriental-avenue', groupId: 'lightblue', price: 100 },
    { id: 'vermont-avenue', groupId: 'lightblue', price: 100 },
    { id: 'st-charles-place', groupId: 'purple', price: 140 },
    { id: 'states-avenue', groupId: 'purple', price: 140 },
    { id: 'st-james-place', groupId: 'orange', price: 180 },
    { id: 'tennessee-avenue', groupId: 'orange', price: 180 },
    { id: 'new-york-avenue', groupId: 'red', price: 200 },
    { id: 'kentucky-avenue', groupId: 'red', price: 220 },
    { id: 'indiana-avenue', groupId: 'yellow', price: 220 },
    { id: 'illinois-avenue', groupId: 'yellow', price: 240 },
  ],
});

const layout: TileBlueprint[] = [
  { type: 'GO' },
  { type: 'PROPERTY', propertyId: 'mediterranean-avenue' },
  { type: 'COMMUNITY_CHEST' },
  { type: 'PROPERTY', propertyId: 'baltic-avenue' },
  { type: 'TAX', amount: 100, name: 'Income Tax' },
  { type: 'RAILROAD', name: 'Reading Railroad' },
  { type: 'JAIL' },
  { type: 'PROPERTY', propertyId: 'oriental-avenue' },
  { type: 'CHANCE' },
  { type: 'PROPERTY', propertyId: 'vermont-avenue' },
  { type: 'PROPERTY', propertyId: 'st-charles-place' },
  { type: 'UTILITY', name: 'Electric Company' },
  { type: 'FREE_PARKING' },
  { type: 'PROPERTY', propertyId: 'states-avenue' },
  { type: 'PROPERTY', propertyId: 'st-james-place' },
  { type: 'COMMUNITY_CHEST' },
  { type: 'PROPERTY', propertyId: 'tennessee-avenue' },
  { type: 'RAILROAD', name: 'B&O Railroad' },
  { type: 'GO_TO_JAIL' },
  { type: 'PROPERTY', propertyId: 'new-york-avenue' },
  { type: 'PROPERTY', propertyId: 'kentucky-avenue' },
  { type: 'CHANCE' },
  { type: 'PROPERTY', propertyId: 'indiana-avenue' },
  { type: 'PROPERTY', propertyId: 'illinois-avenue' },
];

export const QUICK_6x6 = buildBoardModel({
  key: 'quick-6x6',
  label: 'Quick 6x6',
  sideLength: 6,
  economy,
  layout,
});
