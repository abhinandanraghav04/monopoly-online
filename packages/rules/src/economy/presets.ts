import { BoardEconomyPreset } from '../types';

export const QUICK_PRESET: BoardEconomyPreset = {
  key: 'quick',
  label: 'Quick Economy',
  startingCash: 1000,
  goSalary: 150,
  baseRentRate: 0.067,
  houseRentMultipliers: [5, 12.5, 25, 37.5],
  hotelRentMultiplier: 50,
  houseCostRate: 0.75,
  hotelCostRate: 0.75,
  mortgageRate: 0.5,
};

export const CLASSIC_PRESET: BoardEconomyPreset = {
  key: 'classic',
  label: 'Classic Economy',
  startingCash: 1500,
  goSalary: 200,
  baseRentRate: 0.05,
  houseRentMultipliers: [5, 15, 30, 45],
  hotelRentMultiplier: 50,
  houseCostRate: 0.833,
  hotelCostRate: 0.833,
  mortgageRate: 0.5,
};

export const EXTENDED_PRESET: BoardEconomyPreset = {
  key: 'extended',
  label: 'Extended Economy',
  startingCash: 2500,
  goSalary: 300,
  baseRentRate: 0.1,
  houseRentMultipliers: [5, 12.5, 25, 37.5],
  hotelRentMultiplier: 50,
  houseCostRate: 0.75,
  hotelCostRate: 0.75,
  mortgageRate: 0.5,
};

export const MEGA_PRESET: BoardEconomyPreset = {
  key: 'mega',
  label: 'Mega Economy',
  startingCash: 3000,
  goSalary: 400,
  baseRentRate: 0.1,
  houseRentMultipliers: [5, 12.5, 25, 37.5],
  hotelRentMultiplier: 50,
  houseCostRate: 0.75,
  hotelCostRate: 0.75,
  mortgageRate: 0.5,
};
