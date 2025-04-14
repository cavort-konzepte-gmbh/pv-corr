import React from "react";
import { calculateZincLossRate, formatZincLossRate } from "../../services/calculations";

interface CalculationResultProps {
  values: Record<string, any>;
  parameterIds: {
    RESISTIVITY: string;
    CHLORIDES: string;
    SOIL_TYPE: string;
    PH: string;
    COATING_THICKNESS?: string;
  };
}

const CalculationResult: React.FC<CalculationResultProps> = ({ values, parameterIds }) => {
  // Calculate results
  const [zincLossRate, steelLossRate, zincLifetime, requiredReserve] = calculateZincLossRate(values, parameterIds);

  return (
    <div className="p-4 border border-input rounded-md bg-card">
      <h3 className="text-lg font-medium mb-4">Calculation Results</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Zinc Loss Rate:</p>
          <p className="font-mono">{formatZincLossRate(zincLossRate)}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Steel Loss Rate:</p>
          <p className="font-mono">{steelLossRate} μm/year</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Zinc Lifetime:</p>
          <p className="font-mono">{zincLifetime} years</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Required Reserve:</p>
          <p className="font-mono">{requiredReserve} mm</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>Calculation based on AS/NZS 2041.1:2011 standard</p>
      </div>
    </div>
  );
};

export default CalculationResult;
