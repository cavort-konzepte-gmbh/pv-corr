import { showToast } from "../lib/toast";

/**
 * Calculates the zinc loss rate based on soil parameters according to AS/NZS 2041.1:2011 standard
 *
 * @param values Object containing parameter values with their IDs as keys
 * @param parameterIds Object containing parameter IDs for required inputs
 * @returns Array containing [zincLossRate, steelLossRate, zincLifetime, requiredReserve]
 */
export const calculateZincLossRate = (
  values: Record<string, any>,
  parameterIds: {
    RESISTIVITY: string;
    CHLORIDES: string;
    SOIL_TYPE: string;
    PH: string;
    COATING_THICKNESS?: string;
  },
) => {
  try {
    // Extract parameter values
    const resistivity = parseFloat(values[parameterIds.RESISTIVITY]);
    const chlorides = parseFloat(values[parameterIds.CHLORIDES]);
    const soilType = values[parameterIds.SOIL_TYPE];
    const pH = parseFloat(values[parameterIds.PH]);
    const coatingThickness = parameterIds.COATING_THICKNESS ? parseFloat(values[parameterIds.COATING_THICKNESS]) : 85; // Default 85 μm

    console.log("Calculation inputs:", {
      resistivity,
      chlorides,
      soilType,
      pH,
      coatingThickness,
    });

    // Validate inputs
    if (isNaN(resistivity) || isNaN(chlorides) || isNaN(pH)) {
      console.error("Invalid numeric inputs for zinc loss calculation");
      return [0, 0, 0, 0];
    }

    // Determine zinc loss rate based on AS/NZS 2041.1:2011
    let zincLossRate: number[] = [0, 0]; // [mean, standard deviation]

    // Determine soil aggressiveness
    let isAggressive = false;

    // Check conditions for aggressive soil
    if (
      resistivity < 30 || // Resistivity < 30 Ω.m
      chlorides > 300 || // Chlorides > 300 mg/kg
      pH < 5.5 ||
      pH > 8.5 || // pH outside 5.5-8.5 range
      soilType === "undrained" // Undrained soil
    ) {
      isAggressive = true;
    }

    console.log("Soil aggressiveness:", isAggressive);

    // Set zinc loss rate based on soil aggressiveness
    if (isAggressive) {
      zincLossRate = [25, 8]; // Aggressive soil: 25 ± 8 μm/year
    } else {
      zincLossRate = [15, 4]; // Non-aggressive soil: 15 ± 4 μm/year
    }

    // Calculate steel loss rate (always 12 μm/year for this standard)
    const steelLossRate = 12;

    // Calculate zinc lifetime (coating thickness / zinc loss rate)
    const zincLifetime = Math.floor(coatingThickness / zincLossRate[0]);

    // Calculate required reserve (steel loss rate * zinc lifetime / 1000) in mm
    const requiredReserve = ((steelLossRate * zincLifetime) / 1000).toFixed(3);

    console.log("Calculation results:", {
      zincLossRate,
      steelLossRate,
      zincLifetime,
      requiredReserve,
    });

    // Return the results in the expected format
    return [zincLossRate, steelLossRate, zincLifetime, requiredReserve];
  } catch (error) {
    console.error("Error in zinc loss rate calculation:", error);
    showToast("Error calculating zinc loss rate", "error");
    return [[0, 0], 0, 0, 0]; // Return properly structured default values
  }
};

/**
 * Formats the zinc loss rate for display
 *
 * @param zincLossRate Array containing [mean, standard deviation]
 * @returns Formatted string (e.g., "15 ± 4 μm/year")
 */
export const formatZincLossRate = (zincLossRate: number[]): string => {
  if (!Array.isArray(zincLossRate) || zincLossRate.length < 2) {
    return "0 [μm/year]";
  }
  return `${zincLossRate[0]} ± ${zincLossRate[1]} [μm/year]`;
};
