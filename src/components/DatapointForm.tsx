import React, { useState } from 'react';
import { Theme } from '../types/theme';
import { Language, useTranslation } from '../types/language';
import { Standard } from '../types/standards';
import { Parameter } from '../types/parameters';

interface Values {
  [key: string]: string;
}

export interface ParameterInputProps {
  parameter: Parameter;
  value: string;
  onChange: (value: string) => void;
  currentTheme: Theme;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
  parameter,
  value,
  onChange,
  currentTheme
}) => {
  if (parameter.rangeType === 'selection') {
    const options = parameter.rangeValue.split(',').map(opt => opt.trim());
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface"
      >
        <option value="">Select value</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (parameter.rangeType === 'range') {
    if (parameter.parameterCode === 'Z1') {
      return (
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={value === 'impurities' ? '' : value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              // Allow 2 decimal places
              const roundedVal = Math.round(val * 100) / 100;
              if (!isNaN(val) && val >= 0 && val <= 100) {
                onChange(e.target.value);
              }
            }}
            min={0}
            max={100}
            step="0.01"
            disabled={value === 'impurities'}
            className="flex-1 p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter value (0-100)"
          />
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border border-theme hover:bg-opacity-10 bg-surface">
            <input
              type="checkbox"
              checked={value === 'impurities'}
              onChange={(e) => {
                onChange(e.target.checked ? 'impurities' : '');
              }}
              className="rounded border-theme cursor-pointer"
            />
            <span className="text-sm text-primary whitespace-nowrap">Impurities</span>
          </label>
        </div>
      );
    }

    const [minStr, maxStr] = parameter.rangeValue.split('-');
    // Parse range values, handling special cases like "(-1)-0" and "0-10,000"
    const min = parseFloat(minStr.replace(/[,()]/g, '').trim());
    const max = maxStr ? parseFloat(maxStr.replace(/[,()]/g, '').trim()) : undefined;
    
    // Only set min/max if they are valid numbers
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => {
          let val = parseFloat(e.target.value);
          
          // Round to 2 decimal places
          val = Math.round(val * 100) / 100;
          
          // Validate against min/max if they exist
          const isValid = !isNaN(val) && 
            (!isNaN(min) && val >= min) && 
            (max === undefined || val <= max);
            
          if (isValid) {
            onChange(e.target.value);
          }
        }}
        min={!isNaN(min) ? min : undefined}
        max={max !== undefined && !isNaN(max) ? max : undefined}
        step="0.01"
        className="w-full p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface"
        placeholder={`Enter value (${min}${max !== undefined ? ` to ${max}` : '+'})`}
      />
    );
  }

  if (parameter.rangeType === 'greater' || parameter.rangeType === 'greaterEqual') {
    const limit = parseFloat(parameter.rangeValue);
    if (isNaN(limit)) {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step="any"
          className="w-full p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface"
          placeholder="Enter value"
        />
      );
    }
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val) && (
            parameter.rangeType === 'greater' ? val > limit : val >= limit
          )) {
            onChange(e.target.value);
          }
        }}
        min={parameter.rangeType === 'greater' ? limit + 0.000001 : limit}
        step="any"
        className="w-full p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface"
        placeholder={`Enter value ${parameter.rangeType === 'greater' ? '>' : '>='} ${limit}`}
      />
    );
  }

  if (parameter.rangeType === 'less' || parameter.rangeType === 'lessEqual') {
    const limit = parseFloat(parameter.rangeValue);
    if (isNaN(limit)) {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step="any"
          className="w-full p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface"
          placeholder="Enter value"
        />
      );
    }
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val) && (
            parameter.rangeType === 'less' ? val < limit : val <= limit
          )) {
            onChange(e.target.value);
          }
        }}
        max={parameter.rangeType === 'less' ? limit - 0.000001 : limit}
        step="any"
        className="w-full p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface"
        placeholder={`Enter value ${parameter.rangeType === 'less' ? '<' : '<='} ${limit}`}
      />
    );
  }

  // Default to open input
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface"
      placeholder="Enter value"
    />
  );
};

interface DatapointFormProps {
  onSubmit: (data: {
    type: string;
    values: Values;
    ratings: { [key: string]: number };
  }) => void;
  onCancel: () => void;
  currentLanguage: Language;
  currentTheme: Theme;
  standard: Standard;
}

const DatapointForm: React.FC<DatapointFormProps> = ({ 
  onSubmit, 
  onCancel,
  currentLanguage,
  currentTheme,
  standard
}) => {
  const [formValues, setFormValues] = useState<Values>({});
  const t = useTranslation(currentLanguage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ratings = standard.parameters?.reduce((acc, param) => {
      const value = formValues[param.parameterCode];
      if (!value) return acc;

      if (param.ratingRanges) {
        // Special case for Z1 impurities
        if (param.parameterCode === 'Z1' && value === 'impurities') {
          acc[param.parameterCode] = -12;
          return acc;
        }

        // Handle selection type parameters
        if (param.rangeType === 'selection') {
          const range = param.ratingRanges.find(r => r.min === value);
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
          const range = sortedRanges.find(r => {
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
    }, {} as Record<string, number>) || {};

    // Submit if we have at least one valid value
    if (Object.keys(formValues).length > 0) {
      onSubmit({
        type: standard.id,
        values: formValues,
        ratings
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 rounded bg-surface">
      <div className="grid grid-cols-2 gap-4">
        {standard.parameters?.map((param) => (
          <div key={param.parameterCode || index}>
            <label className="block font-mono text-sm mb-2 text-primary">
              {param.parameterCode}
            </label>
            <ParameterInput
              parameter={param}
              value={formValues[param.parameterCode] || ''}
              onChange={(value) => setFormValues(prev => ({
                ...prev,
                [param.parameterCode]: value
              }))}
              currentTheme={currentTheme}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded font-mono text-sm text-secondary border-theme border-solid bg-transparent"          
        >
          {t('actions.cancel')}
        </button>
        <button
          type="submit"
          disabled={Object.keys(formValues).length === 0}
          className="px-4 py-2 rounded font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed text-white bg-accent-primary"          
        >
          {t('datapoint.new')}
        </button>
      </div>
    </form>
  );
};

export default DatapointForm;