import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Field } from '../../../../types/projects';
import { ChevronRight, Edit2, X, MoreVertical } from 'lucide-react';
import { googleMaps } from "../../../../utils/google-maps"
import { EditField } from './EditField';
import { deleteField } from '../../../../services/fields';
import { fetchProjects } from '../../../../services/projects';

interface FieldListProps {
  currentTheme: Theme;
  fields: Field[];
  onSelectField: (fieldId: string) => void;
  onProjectsChange: (projects: Project[]) => void;
}

const FieldList: React.FC<FieldListProps> = ({
  currentTheme,
  fields,
  onSelectField,
  onProjectsChange
}) => {
  const [showForm, setShowForm] = useState(false);
  const [fieldData, setFieldData] = useState({
    id: '',
    name: '',
    latitude: '',
    longitude: '',
    has_fence: 'no'
  });

  const handleSelectField = (event: React.MouseEvent, field: Field) => {
    event.stopPropagation();
    setShowForm(true);
    console.log(field)
    setFieldData(field);
  }

  const handleOpenGoogleMaps = (event: React.MouseEvent, latitude: number, longitude: number) => {
    event.stopPropagation();
    googleMaps(latitude, longitude);
  }

  const handleRemoveField = async (event: React.MouseEvent, field: Field) => {
    event.stopPropagation();
    await deleteField(field.id);
    const updatedProjects = await fetchProjects();
    onProjectsChange(updatedProjects)
  }

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
            <div className="text-secondary flex items-center gap-2">
              <div className="relative group">
                <MoreVertical size={14} />
                <ul className="hidden rounded border-theme border-solid absolute top-0 right-4 transition-all duration-1000 bg-theme group-hover:block">
                  <li 
                    className="w-full py-2 px-4 flex items-center justify-between gap-x-2 border-b-theme"
                    onClick={(event) => handleSelectField(event, field)}
                  >
                    Edit <Edit2 size={14} />
                  </li>
                  <li 
                    className="w-full py-2 px-4 flex items-center justify-between gap-x-2"
                    onClick={(event) => handleRemoveField(event, field)}
                  >
                    Remove <X size={14} />
                  </li>
                </ul>
              </div>
              <ChevronRight size={16} />
            </div>
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
                  onClick={(e) => handleOpenGoogleMaps(e, field.latitude, field.longitude)}
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
      {showForm && (
        <EditField 
          field={fieldData} 
          setShowForm={setShowForm} 
          onProjectsChange={onProjectsChange} 
        />
      )}
    </div>
  );
};

export default FieldList;