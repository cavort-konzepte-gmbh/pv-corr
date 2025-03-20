import React from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Datapoint } from '../../types/projects';
import { Check, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

interface AnalyseDataProps {
  currentTheme: Theme;
  currentLanguage: Language;
  datapoints: Datapoint[];
  selectedDatapoints: string[];
  onToggleDatapoint: (id: string) => void;
}

type SortField = 'name' | 'timestamp';
type SortOrder = 'asc' | 'desc';

const AnalyseData: React.FC<AnalyseDataProps> = ({
  currentTheme,
  currentLanguage,
  datapoints,
  selectedDatapoints,
  onToggleDatapoint
}) => {
  const t = useTranslation(currentLanguage);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Get name from datapoint, falling back to id if not available
  const getDatapointName = (datapoint: Datapoint) => {
    return datapoint.name || datapoint.id;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedDatapoints = [...datapoints].sort((a, b) => {
    const aValue = sortField === 'name' 
      ? getDatapointName(a).toLowerCase()
      : a.timestamp;
    const bValue = sortField === 'name'
      ? getDatapointName(b).toLowerCase()
      : b.timestamp;
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-primary">
          {t("analysis.select_datapoints")}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSort('name')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
              sortField === 'name' ? 'text-accent-primary bg-theme' : 'text-secondary'
            }`}
          >
            Name
            <ArrowUpDown size={12} />
          </Button>
          <button
            onClick={() => handleSort('timestamp')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
              sortField === 'timestamp' ? 'text-accent-primary bg-theme' : 'text-secondary'
            }`}
          >
            Date
            <ArrowUpDown size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {sortedDatapoints.map(datapoint => {
          return (
            <Button
              key={datapoint.id}
              onClick={() => onToggleDatapoint(datapoint.id)}
              className={`p-2 rounded border transition-all hover:translate-x-1 text-left ${
                selectedDatapoints.includes(datapoint.id)
                  ? 'border-accent-primary bg-opacity-10'
                  : 'border-theme'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-primary">
                    {getDatapointName(datapoint)}
                  </div>
                </div>
                {selectedDatapoints.includes(datapoint.id) && (
                  <Check size={12} className="text-accent-primary" />
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyseData;