import React from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Datapoint } from '../../types/projects';
import { Check, Info } from 'lucide-react';

interface AnalyseDataProps {
  currentTheme: Theme;
  currentLanguage: Language;
  datapoints: Datapoint[];
  selectedDatapoints: string[];
  onToggleDatapoint: (id: string) => void;
}

const AnalyseData: React.FC<AnalyseDataProps> = ({
  currentTheme,
  currentLanguage,
  datapoints,
  selectedDatapoints,
  onToggleDatapoint
}) => {
  const t = useTranslation(currentLanguage);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-primary mb-4">
        {t("analysis.select_datapoints")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datapoints.map(datapoint => {
          const missingParams = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7', 'Z8', 'Z9', 'Z10', 'Z15']
            .filter(code => !Object.keys(datapoint.values).includes(code.toLowerCase()));

          const b0 = Object.entries(datapoint.ratings)
            .filter(([code]) => ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z8', 'z9', 'z10'].includes(code))
            .reduce((sum, [_, rating]) => sum + rating, 0);

          const b1 = b0 + Object.entries(datapoint.ratings)
            .filter(([code]) => ['z11', 'z12', 'z13', 'z14', 'z15'].includes(code))
            .reduce((sum, [_, rating]) => sum + rating, 0);

          const classification = b0 >= 0 ? { class: 'Ia', stress: 'Sehr niedrig' } :
                               b0 >= -4 ? { class: 'Ib', stress: 'Niedrig' } :
                               b0 >= -10 ? { class: 'II', stress: 'Mittel' } :
                               { class: 'III', stress: 'Hoch' };

          return (
            <button
              key={datapoint.id}
              onClick={() => onToggleDatapoint(datapoint.id)}
              className={`p-4 rounded-lg border transition-all hover:translate-x-1 text-left ${
                selectedDatapoints.includes(datapoint.id)
                  ? 'border-accent-primary bg-opacity-10'
                  : 'border-theme'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-primary">
                    {datapoint.name || datapoint.sequentialId}
                  </div>
                  <div className="text-sm text-secondary">
                    {new Date(datapoint.timestamp).toLocaleString()}
                  </div>
                </div>
                {selectedDatapoints.includes(datapoint.id) && (
                  <Check size={16} className="text-accent-primary" />
                )}
              </div>

              {missingParams.length > 0 && missingParams.length < 11 && (
                <div className="flex items-center gap-2 mt-2 text-xs text-secondary">
                  <Info size={12} />
                  <span>Missing: {missingParams.join(', ')}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyseData;