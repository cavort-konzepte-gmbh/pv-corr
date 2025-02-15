import React, { useState } from 'react';
import { Theme } from '../types/theme';
import { Language } from '../types/language';
import { Project } from '../types/projects';
import { MapPin } from 'lucide-react';

interface ZonesPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  selectedProjectId?: string;
  selectedFieldId?: string;
  onSelectZone: (zoneId: string) => void;
}

const ZonesPanel: React.FC<ZonesPanelProps> = ({
  currentTheme,
  projects,
  onProjectsChange,
  selectedProjectId,
  selectedFieldId,
  onSelectZone
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  const selectedField = selectedProject && selectedFieldId
    ? selectedProject.fields.find(f => f.id === selectedFieldId)
    : null;

  if (!selectedProject || !selectedField) {
    return (
      <div 
        className="p-6 text-center"
        style={{ color: currentTheme.colors.text.secondary }}
      >
        Please select a field to view its zones
      </div>
    );
  }

  const zones = selectedField.zones;
  const selectedZone = selectedZoneId ? zones.find(z => z.id === selectedZoneId) : null;

  return (
    <div className="p-6">
      {/* Field Summary */}
      <div
        className="p-6 rounded-lg mb-8"
        style={{ 
          backgroundColor: currentTheme.colors.surface, 
          border: `1px solid ${currentTheme.colors.border}`
        }}
      >
        <div className="text-2xl font-mono mb-4" style={{ color: currentTheme.colors.text.primary }}>
          {selectedField.name}
        </div>
        <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
          {selectedProject.name}
        </div>
        {selectedField.latitude && selectedField.longitude && (
          <button
            onClick={() => window.open(`https://www.google.com/maps?q=${selectedField.latitude},${selectedField.longitude}`, '_blank')}
            className="text-sm hover:underline mt-2"
            style={{ color: currentTheme.colors.accent.primary }}
          >
            View on map
          </button>
        )}
      </div>

      {selectedZone ? (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setSelectedZoneId(null)}
              className="text-sm flex items-center gap-1"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              ← Back to zones
            </button>
          </div>

          <div className="space-y-4">
            <div
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-medium"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {selectedZone.name}
                </h3>
                {selectedZone.latitude && selectedZone.longitude && (
                  <button
                    onClick={() => window.open(`https://www.google.com/maps?q=${selectedZone.latitude},${selectedZone.longitude}`, '_blank')}
                    className="text-sm flex items-center gap-1 hover:underline"
                    style={{ color: currentTheme.colors.accent.primary }}
                  >
                    <MapPin size={14} />
                    View on map
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full" style={{ color: currentTheme.colors.text.primary }}>
                  <thead>
                    <tr>
                      <th className="text-left p-2 font-medium">ID</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Values</th>
                      <th className="text-left p-2 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedZone.datapoints?.map(datapoint => (
                      <tr 
                        key={datapoint.id}
                        style={{ borderTop: `1px solid ${currentTheme.colors.border}` }}
                      >
                        <td className="p-2">{datapoint.sequentialId}</td>
                        <td className="p-2">{datapoint.type}</td>
                        <td className="p-2">
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
                        <td className="p-2 text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                          {new Date(datapoint.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map(zone => (
            <div
              key={zone.id}
              className="p-4 rounded-lg transition-all hover:translate-y-[-2px]"
              onClick={() => onSelectZone(zone.id)}
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                border: `1px solid ${currentTheme.colors.border}`,
                boxShadow: `0 2px 4px ${currentTheme.colors.border}`,
                cursor: 'pointer'
              }}
            >
              <h3 
                className="font-medium mb-2"
                style={{ color: currentTheme.colors.text.primary }}
              >
                {zone.name}
              </h3>
              <div className="flex justify-between items-center">
                <span 
                  className="text-sm"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  {zone.datapoints?.length || 0} datapoints
                </span>
                {zone.latitude && zone.longitude && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps?q=${zone.latitude},${zone.longitude}`, '_blank');
                    }}
                    className="text-sm hover:underline"
                    style={{ color: currentTheme.colors.accent.primary }}
                  >
                    View on map
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ZonesPanel;