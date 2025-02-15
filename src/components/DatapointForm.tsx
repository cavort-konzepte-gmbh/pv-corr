import React, { useState } from 'react';
import { Theme } from '../types/theme';
import { Language, useTranslation } from '../types/language';
import { Standard } from '../types/standards';

interface Values {
  [key: string]: string;
}

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
    
    // Calculate ratings based on form values
    const ratings = standard.parameters?.reduce((acc, param) => {
      const value = formValues[param.parameterCode];
      if (!value) return acc;

      if (param.ratingRanges) {
        // Find matching range
        const range = param.ratingRanges.find(r => {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) return false;
          
          const min = r.min === null ? -Infinity : parseFloat(r.min.toString());
          const max = r.max === null ? Infinity : parseFloat(r.max.toString());
          
          return numValue >= min && numValue < max;
        });

        if (range) {
          acc[param.parameterCode] = range.rating;
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
        {standard.parameters?.map((param, index) => (
          <div key={param.parameterCode || index}>
            <label className="block font-mono text-sm mb-2 text-primary">
              {param.parameterCode}
            </label>
            <input
              type="text"
              value={formValues[param.parameterCode] || ''}
              onChange={(e) => setFormValues(prev => ({
                ...prev,
                [param.parameterCode]: e.target.value
              }))}
              className="w-full p-2 rounded font-mono text-sm border focus:outline-none text-primary border-theme bg-surface"              
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