import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { Edit2, Save } from 'lucide-react';
import { Language, useTranslation } from '../types/language';
import { Zone } from '../types/projects';

interface DatapointsPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  selectedZone?: Zone | null;
  onBack?: () => void;
}

const DatapointsPanel: React.FC<DatapointsPanelProps> = ({
  currentTheme,
  currentLanguage,
  selectedZone,
  onBack
}) => {
  const t = useTranslation(currentLanguage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDatapoint, setEditingDatapoint] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(false);
  }, []);

  if (!selectedZone) {
    return (
      <div 
        className="p-6 text-center"
        style={{ color: currentTheme.colors.text.secondary }}
      >
        Please select a zone to view its datapoints
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="text-sm flex items-center gap-1"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          ← Back to zones
        </button>
      </div>

      {error && (
        <div 
          className="p-4 mb-4 rounded"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            color: currentTheme.colors.accent.primary,
            border: `1px solid ${currentTheme.colors.accent.primary}`
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div 
          className="text-center p-4"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          {t("datapoint.loading")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table 
              className="w-full border-collapse"
              style={{ 
                color: currentTheme.colors.text.primary,
                borderColor: currentTheme.colors.border
              }}
            >
              <thead>
                <tr>
                  <th 
                    className="p-2 text-left border font-normal"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    ID
                  </th>
                  <th 
                    className="p-2 text-left border font-normal"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    Type
                  </th>
                  <th 
                    className="p-2 text-left border font-normal"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    Values
                  </th>
                  <th 
                    className="p-2 text-left border font-normal"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    Timestamp
                  </th>
                  <th 
                    className="p-2 text-center border font-normal"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedZone.datapoints?.map(datapoint => (
                  <tr key={datapoint.id}>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      {datapoint.sequentialId}
                    </td>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      {datapoint.type}
                    </td>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(datapoint.values).map(([key, value]) => (
                          <span 
                            key={key}
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: currentTheme.colors.background,
                              border: `1px solid ${currentTheme.colors.border}`
                            }}
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td 
                      className="p-2 border text-sm"
                      style={{ 
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.secondary 
                      }}
                    >
                      {new Date(datapoint.timestamp).toLocaleString()}
                    </td>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (editingDatapoint === datapoint.id) {
                              // Save changes
                              setEditingDatapoint(null);
                              setEditingValues({});
                            } else {
                              setEditingDatapoint(datapoint.id);
                              setEditingValues(datapoint.values);
                            }
                          }}
                          className="p-1 rounded hover:bg-opacity-80"
                          style={{ color: currentTheme.colors.text.secondary }}
                        >
                          {editingDatapoint === datapoint.id ? (
                            <Save size={14} />
                          ) : (
                            <Edit2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatapointsPanel;