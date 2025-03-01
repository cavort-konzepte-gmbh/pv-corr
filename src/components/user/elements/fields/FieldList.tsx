import React from 'react';
import { Theme } from '../../../../types/theme';
import { Field } from '../../../../types/projects';
import { ChevronRight, Edit2 } from 'lucide-react';

interface FieldListProps {
  currentTheme: Theme;
  fields: Field[];
  onSelectField: (fieldId: string) => void;
}

const FieldList: React.FC<FieldListProps> = ({
  currentTheme,
  fields,
  onSelectField
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fields.map(field => (
        <div
          key={field.id}
          className="p-4 rounded-lg transition-all hover:translate-y-[-2px] border-theme border-solid shadow-border bg-surface hover:cursor-pointer"
          onClick={() => onSelectField(field.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-primary">
              <div className="flex items-center gap-2">
                <span>{field.name}</span>
              </div>
            </h3>
            <ChevronRight className="text-secondary" size={16} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary">
              {field.zones.length} zones • {
                field.zones.reduce((acc, zone) => acc + (zone.datapoints?.length || 0), 0)
              } datapoints
              {field.has_fence && ' • Fenced'}
            </span>
            {field.latitude && field.longitude && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/maps?q=${field.latitude},${field.longitude}`, '_blank');
                  }}
                  className="text-sm hover:underline text-accent-primary"
                >
                  View on map
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle edit coordinates
                  }}
                  className="p-1 rounded hover:bg-opacity-80 text-secondary"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FieldList;