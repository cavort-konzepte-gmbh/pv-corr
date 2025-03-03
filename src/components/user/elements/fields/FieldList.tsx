import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Field } from '../../../../types/projects';
import { ChevronRight, Edit2, X, MoreVertical } from 'lucide-react';
import { googleMaps } from "../../../../utils/google-maps";
import { deleteField, updateField } from '../../../../services/fields';
import { fetchProjects } from '../../../../services/projects';
import { Language, useTranslation } from '../../../../types/language';

interface FieldListProps {
  currentTheme: Theme;
  fields: Field[];
  onSelectField: (fieldId: string) => void;
  onProjectsChange: (projects: Project[]) => void;
  currentLanguage: Language
}

const FieldList: React.FC<FieldListProps> = ({
  currentTheme,
  fields: initialFields,
  onSelectField,
  onProjectsChange,
  currentLanguage,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [updatingField, setUpdatingField] = useState(false);
  const [localFields, setLocalFields] = useState(initialFields);
  const translation = useTranslation(currentLanguage);

  const handleSave = async (field: Field) => {
    if (updatingField) return;
    try {
      setUpdatingField(true);
      
      // Update local state immediately for better UX
      const updatedField = {
        ...field,
        has_fence: editingValues.has_fence || field.has_fence
      };
      setLocalFields(prevFields => 
        prevFields.map(f => f.id === field.id ? updatedField : f)
      );
      
      // Send update to server
      await updateField(field.id, updatedField);
      
      // Refresh projects to ensure sync
      const updatedProjects = await fetchProjects();
      onProjectsChange(updatedProjects);
      
      setEditingId(null);
      setEditingValues({});
    } catch (err) {
      console.error('Error saving field:', err);
      // Revert local state on error
      setLocalFields(initialFields);
    } finally {
      setUpdatingField(false);
    }
  };

  const handleOpenGoogleMaps = (event: React.MouseEvent, latitude: number, longitude: number) => {
    event.stopPropagation();
    googleMaps(latitude, longitude);
  }

  const handleRemoveField = async (event: React.MouseEvent, field: Field) => {
    event.stopPropagation();
    await deleteField(field.id);
    const updatedProjects = await fetchProjects();
    onProjectsChange(updatedProjects);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-theme text-primary">
        <thead>
          <tr>
            <th className="p-2 text-left border font-normal border-theme">
              {translation("field.name")}
            </th>
            <th className="p-2 text-left border font-normal border-theme">
              {translation("field.has_fence")}
            </th>
            <th className="p-2 text-left border font-normal border-theme">
              {translation("zones.location")}
            </th>
            <th className="p-2 text-center border font-normal border-theme">
              {translation("actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {localFields.map(field => (
            <tr key={field.id} className="hover:bg-opacity-50">
              <td className="p-2 border border-theme">
                {editingId === field.id ? (
                  <input
                    type="text"
                    value={editingValues.name || field.name}
                    onChange={(e) => setEditingValues({ ...editingValues, name: e.target.value })}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                  />
                ) : field.name}
              </td>
              <td className="p-2 border border-theme">
                {editingId === field.id ? (
                  <select
                    value={editingValues.has_fence || field.has_fence || 'no'}
                    onChange={async (e) => {
                      const newValue = e.target.value;
                      setEditingValues({ ...editingValues, has_fence: newValue });
                      await handleSave({ ...field, has_fence: newValue });
                    }}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    disabled={updatingField}
                  >
                    <option value="no">{translation("field.has_fence.no")}</option>
                    <option value="yes">{translation("field.has_fence.yes")}</option>
                  </select>
                ) : (
                  (field.has_fence || 'no') === 'yes' ? translation("field.has_fence.yes") : translation("field.has_fence.no")
                )}
              </td>
              <td className="p-2 border border-theme">
                {editingId === field.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingValues.latitude || field.latitude || ''}
                      onChange={(e) => setEditingValues({ ...editingValues, latitude: e.target.value })}
                      className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                      placeholder={translation("project.latitude")}
                    />
                    <input
                      type="text"
                      value={editingValues.longitude || field.longitude || ''}
                      onChange={(e) => setEditingValues({ ...editingValues, longitude: e.target.value })}
                      className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                      placeholder={translation("project.longitude")}
                    />
                  </div>
                ) : field.latitude && field.longitude ? (
                  <button
                    onClick={event => handleOpenGoogleMaps(event, field.latitude, field.longitude)}
                    className="text-sm hover:underline text-accent-primary"
                  >
                    {translation("general.view_on_map")}
                  </button>
                ) : (
                  <span className="text-secondary">{translation("general.location_not_set")}</span>
                )}
              </td>
              <td className="p-2 border border-theme">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      if (editingId === field.id) {
                        handleSave(field);
                      } else {
                        setEditingId(field.id);
                        setEditingValues({
                          name: field.name,
                          latitude: field.latitude || '',
                          longitude: field.longitude || '',
                          has_fence: field.has_fence
                        });
                      }
                    }}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    {editingId === field.id ? <Save size={14} /> : <Edit2 size={14} />}
                  </button>
                  {editingId === field.id && (
                    <button
                      onClick={event => handleRemoveField(event, field)}
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => onSelectField(field.id)}
                    className="p-1 rounded hover:bg-opacity-80 text-accent-primary"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FieldList;