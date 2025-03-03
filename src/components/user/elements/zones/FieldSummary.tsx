import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Edit2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Language, useTranslation } from '../../../../types/language';
import { updateField } from '../../../../services/fields';
import { fetchProjects } from '../../../../services/projects';

interface FieldSummaryProps {
  field: {
    id?: string;
    name: string;
    latitude?: string;
    longitude?: string;
    has_fence?: string;
    zones?: any[];
  };
  currentTheme: Theme;
  currentLanguage: Language;
  onProjectsChange: (projects: any[]) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const FieldSummary: React.FC<FieldSummaryProps> = ({
  field,
  currentTheme,
  currentLanguage,
  onProjectsChange,
  isExpanded = true,
  onToggle
}) => {
  const translation = useTranslation(currentLanguage);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: field.name || '',
    latitude: field.latitude || '',
    longitude: field.longitude || '',
    has_fence: field.has_fence || 'no'
  });

  const handleSave = async () => {
    if (!field.id) return;
    
    try {
      await updateField(field.id, editValues);
      const updatedProjects = await fetchProjects();
      onProjectsChange(updatedProjects);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating field:', err);
    }
  };

  return (
    <div className="mb-8">
      <table className="w-full border-collapse rounded-lg border transition-all text-primary border-theme bg-surface">
        <thead>
          <tr>
            <th colSpan={2} className="p-4 text-left border-b font-semibold border-theme cursor-pointer" onClick={onToggle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    />
                  ) : (
                    <span>{field.name}</span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-secondary bg-border">
                      {field.zones?.length || 0} {translation("zones")}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-secondary bg-border">
                      {field.zones?.reduce((acc, zone) => acc + (zone.datapoints?.length || 0), 0) || 0} {translation("datapoints")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="text-secondary" size={16} />
                  ) : (
                    <ChevronRight className="text-secondary" size={16} />
                  )}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className={isExpanded ? '' : 'hidden'}>
          <tr>
            <td className="p-2 border-r border-theme w-1/6 text-secondary">
              {translation("zones.location")}
            </td>
            <td className="p-2 border-theme">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editValues.latitude}
                    onChange={(e) => setEditValues({ ...editValues, latitude: e.target.value })}
                    className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder={translation("project.latitude")}
                  />
                  <input
                    type="text"
                    value={editValues.longitude}
                    onChange={(e) => setEditValues({ ...editValues, longitude: e.target.value })}
                    className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder={translation("project.longitude")}
                  />
                </div>
              ) : field.latitude && field.longitude ? (
                <div className="flex items-center justify-between">
                  <span>{field.latitude}, {field.longitude}</span>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps?q=${field.latitude},${field.longitude}`, '_blank')}
                    className="text-sm hover:underline text-accent-primary"
                  >
                    {translation("general.view_on_map")}
                  </button>
                </div>
              ) : (
                <span className="text-secondary">{translation("general.location_not_set")}</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="p-2 border-r border-theme w-1/6 text-secondary">
              {translation("field.has_fence")}
            </td>
            <td className="p-2 border-theme">
              {isEditing ? (
                <select
                  value={editValues.has_fence}
                  onChange={(e) => setEditValues({ ...editValues, has_fence: e.target.value })}
                  className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="no">{translation("field.has_fence.no")}</option>
                  <option value="yes">{translation("field.has_fence.yes")}</option>
                </select>
              ) : (
                field.has_fence === 'yes' ? translation("field.has_fence.yes") : translation("field.has_fence.no")
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FieldSummary;