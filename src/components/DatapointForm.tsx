import React, { useState } from "react";
import { Theme } from "../types/theme";
import { Language, useTranslation } from "../types/language";
import { Standard } from "../types/standards";
import { Parameter } from "../types/parameters";
import { Plus, Save, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface Values {
  [key: string]: string;
}

export interface ParameterInputProps {
  parameter: Parameter;
  value: string;
  onChange: (value: string) => void;
  currentTheme: Theme;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({ parameter, value, onChange, currentTheme }) => {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Validate and update parent component on blur
  const handleBlur = () => {
    if (parameter.rangeType === "range") {
      const [minStr, maxStr] = parameter.rangeValue.split("-");
      const min = parseFloat(minStr.replace(/[,()]/g, "").trim());
      const max = maxStr ? parseFloat(maxStr.replace(/[,()]/g, "").trim()) : undefined;

      // Special case for Z1 impurities
      if (parameter.parameterCode === "Z1" && localValue === "impurities") {
        onChange(localValue);
        setError(null);
        return;
      }

      // Empty value is allowed
      if (localValue === "") {
        onChange("");
        setError(null);
        return;
      }

      // Validate numeric value
      const numValue = parseFloat(localValue);
      if (!isNaN(numValue)) {
        const isValid = (isNaN(min) || numValue >= min) && (max === undefined || isNaN(max) || numValue <= max);

        if (isValid) {
          onChange(localValue);
          setError(null);
        } else {
          setError(`Value must be between ${min}${max !== undefined ? ` and ${max}` : "+"}`);
        }
      } else {
        setError("Please enter a valid number");
      }
    } else {
      // For non-range types, just pass the value through
      onChange(localValue);
      setError(null);
    }
  };

  if (parameter.rangeType === "selection") {
    const options = parameter.rangeValue.split(",").map((opt) => opt.trim());
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded text-sm border border-input shadow-sm bg-accent"
      >
        <option value="">Select value</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (parameter.rangeType === "range") {
    if (parameter.parameterCode === "Z1") {
      return (
        <div className="flex items-center gap-4">
          <Input
            type="text"
            value={localValue === "impurities" ? "" : localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            min={0}
            max={100}
            step="0.01"
            disabled={localValue === "impurities"}
            className="flex-1 p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter value (0-100)"
          />
          <Label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border border-theme hover:bg-opacity-10 bg-surface">
            <Input
              type="checkbox"
              checked={localValue === "impurities"}
              onChange={(e) => {
                const newValue = e.target.checked ? "impurities" : "";
                setLocalValue(newValue);
                onChange(newValue);
              }}
              className="rounded border-theme cursor-pointer"
            />
            <span className="text-sm text-primary whitespace-nowrap">Impurities</span>
          </Label>
        </div>
      );
    }

    const [minStr, maxStr] = parameter.rangeValue.split("-");
    // Parse range values, handling special cases like "(-1)-0" and "0-10,000"
    const min = parseFloat(minStr.replace(/[,()]/g, "").trim());
    const max = maxStr ? parseFloat(maxStr.replace(/[,()]/g, "").trim()) : undefined;

    // Debug the range values
    // console.log(`Range for ${parameter.parameterCode}: min=${min}, max=${max}`);

    // Only set min/max if they are valid numbers
    return (
      <div className="w-full">
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          min={!isNaN(min) ? min : undefined}
          max={max !== undefined && !isNaN(max) ? max : undefined}
          step="0.01"
          className={`w-full p-2 rounded font-mono text-sm ${error ? "border-destructive" : ""}`}
          placeholder={`Enter value (${min}${max !== undefined ? ` to ${max}` : "+"})`}
        />
        {error && <div className="text-destructive text-xs mt-1">{error}</div>}
      </div>
    );
  }

  if (parameter.rangeType === "greater" || parameter.rangeType === "greaterEqual") {
    const limit = parseFloat(parameter.rangeValue);
    if (isNaN(limit)) {
      return (
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          step="any"
          className="w-full p-2 rounded font-mono text-sm "
          placeholder="Enter value"
        />
      );
    }
    return (
      <div className="w-full">
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          min={parameter.rangeType === "greater" ? limit + 0.000001 : limit}
          step="any"
          className={`w-full p-2 ${error ? "border-destructive" : ""}`}
          placeholder={`Enter value ${parameter.rangeType === "greater" ? ">" : ">="} ${limit}`}
        />
        {error && <div className="text-destructive text-xs mt-1">{error}</div>}
      </div>
    );
  }

  if (parameter.rangeType === "less" || parameter.rangeType === "lessEqual") {
    const limit = parseFloat(parameter.rangeValue);
    if (isNaN(limit)) {
      return (
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          step="any"
          className="w-full p-2 rounded font-mono text-sm "
          placeholder="Enter value"
        />
      );
    }
    return (
      <div className="w-full">
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          max={parameter.rangeType === "less" ? limit - 0.000001 : limit}
          step="any"
          className={`w-full p-2 rounded font-mono text-sm ${error ? "border-destructive" : ""}`}
          placeholder={`Enter value ${parameter.rangeType === "less" ? "<" : "<="} ${limit}`}
        />
        {error && <div className="text-destructive text-xs mt-1">{error}</div>}
      </div>
    );
  }

  // Default to open input
  return (
    <Input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="w-full p-2 rounded font-mono text-sm "
      placeholder="Enter value"
    />
  );
};

interface DatapointFormProps {
  onSubmit: (data: { type: string; values: Values; ratings: { [key: string]: number } }) => void;
  onCancel: () => void;
  currentLanguage: Language;
  currentTheme: Theme;
  standard: Standard;
}

const DatapointForm: React.FC<DatapointFormProps> = ({ onSubmit, onCancel, currentLanguage, currentTheme, standard }) => {
  const [formValues, setFormValues] = useState<Values>({});
  const t = useTranslation(currentLanguage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ratings =
      standard.parameters?.reduce(
        (acc, param) => {
          const value = formValues[param.parameterCode];
          if (!value) return acc;

          if (param.ratingRanges) {
            // Special case for Z1 impurities
            if (param.parameterCode === "Z1" && value === "impurities") {
              acc[param.parameterCode] = -12;
              return acc;
            }

            // Handle selection type parameters
            if (param.rangeType === "selection") {
              const range = param.ratingRanges.find((r) => r.min === value);
              if (range) {
                acc[param.parameterCode] = range.rating;
              }
              return acc;
            }

            // Handle numeric ranges
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              // Sort ranges by min value descending to get most specific match first
              const sortedRanges = [...param.ratingRanges].sort((a, b) => {
                const aMin = parseFloat(a.min.toString());
                const bMin = parseFloat(b.min.toString());
                return bMin - aMin;
              });

              // Find first matching range
              const range = sortedRanges.find((r) => {
                const min = parseFloat(r.min.toString());
                const max = r.max ? parseFloat(r.max.toString()) : Infinity;
                return numValue >= min && numValue < max;
              });

              if (range) {
                acc[param.parameterCode] = range.rating;
              }
            }
          }
          return acc;
        },
        {} as Record<string, number>,
      ) || {};

    // Submit if we have at least one valid value
    if (Object.keys(formValues).length > 0) {
      onSubmit({
        type: standard.id,
        values: formValues,
        ratings,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 rounded bg-surface">
      <div className="grid grid-cols-2 gap-4">
        {standard.parameters?.map((param) => (
          <div key={param.parameterCode || index}>
            <Label className="block font-mono text-sm mb-2 text-primary">{param.parameterCode}</Label>
            <ParameterInput
              parameter={param}
              value={formValues[param.parameterCode] || ""}
              onChange={(value) =>
                setFormValues((prev) => ({
                  ...prev,
                  [param.parameterCode]: value,
                }))
              }
              currentTheme={currentTheme}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onCancel} className="size-8">
          {t("actions.cancel")}
        </Button>
        <Button type="submit" disabled={Object.keys(formValues).length === 0} className="size-8">
          {t("datapoint.new")}
        </Button>
      </div>
    </form>
  );
};

export default DatapointForm;
