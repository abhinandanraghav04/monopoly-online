import { BoardEconomy, BoardEconomyPreset, PropertyEconomy, PropertyGroupDefinition } from '../types';

export interface PropertyDefinition {
  id: string;
  groupId: string;
  price: number;
  rentModifier?: number;
  baseRent?: number;
  houseCost?: number;
  hotelCost?: number;
  mortgageValue?: number;
}

function toPropertyEconomy(
  preset: BoardEconomyPreset,
  definition: PropertyDefinition,
): PropertyEconomy {
  const baseRentFromPrice = Math.round(definition.price * preset.baseRentRate * (definition.rentModifier ?? 1));
  const baseRent = definition.baseRent ?? baseRentFromPrice;

  const rent: PropertyEconomy['rent'] = {
    base: baseRent,
    houses: preset.houseRentMultipliers.map((multiplier) => Math.round(baseRent * multiplier)) as [
      number,
      number,
      number,
      number,
    ],
    hotel: Math.round(baseRent * preset.hotelRentMultiplier),
  };

  const houseCost = definition.houseCost ?? Math.round(definition.price * preset.houseCostRate);
  const hotelCost = definition.hotelCost ?? Math.round(definition.price * preset.hotelCostRate);
  const mortgageValue = definition.mortgageValue ?? Math.round(definition.price * preset.mortgageRate);

  return {
    id: definition.id,
    groupId: definition.groupId,
    price: definition.price,
    rent,
    houseCost,
    hotelCost,
    mortgageValue,
  };
}

export interface EconomyDefinition {
  key: string;
  label: string;
  preset: BoardEconomyPreset;
  propertyGroups: PropertyGroupDefinition[];
  properties: PropertyDefinition[];
}

export function buildEconomy(definition: EconomyDefinition): BoardEconomy {
  const propertyGroups: Record<string, PropertyGroupDefinition> = {};
  definition.propertyGroups.forEach((group) => {
    propertyGroups[group.id] = { ...group };
  });

  const properties: Record<string, PropertyEconomy> = {};
  definition.properties.forEach((property) => {
    properties[property.id] = toPropertyEconomy(definition.preset, property);
  });

  const missingGroup = Object.values(propertyGroups).find((group) => {
    const groupCount = definition.properties.filter((prop) => prop.groupId === group.id).length;
    return groupCount !== group.propertyCount;
  });

  if (missingGroup) {
    throw new Error(
      `Property group ${missingGroup.id} expects ${missingGroup.propertyCount} properties but was given a different amount.`,
    );
  }

  return {
    key: definition.key,
    label: definition.label,
    startingCash: definition.preset.startingCash,
    goSalary: definition.preset.goSalary,
    preset: definition.preset,
    propertyGroups,
    properties,
  };
}
