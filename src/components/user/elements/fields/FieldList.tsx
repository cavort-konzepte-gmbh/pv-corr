import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Field, Project } from '../../../../types/projects';
import { ChevronRight, Edit2, X, MoreVertical, Save, Plus } from 'lucide-react';
import { googleMaps } from "../../../../utils/google-maps";
import { deleteField, updateField } from '../../../../services/fields';
import { fetchProjects } from '../../../../services/projects';
import { Language, useTranslation } from '../../../../types/language';
import { FormHandler } from '../../../shared/FormHandler';
import { createField } from '../../../../services/fields';

interface FieldListProps {
  currentTheme: Theme;
  fields?: Field[];
  onSelectField: (fieldId: string) => void;
  onProjectsChange: (projects: Project[]) => void;
  currentLanguage: Language;
  selectedProjectId: string;
  selectedCustomerId: string | null
}

const FieldList: React.FC<FieldListProps> = ({
  currentTheme,
  fields: initialFields,
  onSelectField,
  onProjectsChange,
  currentLanguage,
  selectedProjectId,
  selectedCustomerId
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [updatingField, setUpdatingField] = useState(false);
  const [localFields, setLocalFields] = useState(initialFields || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newValues, setNewValues] = useState({
    name: '',
    latitude: '',
    longitude: '',
    has_fence: ''
  });
  const [error, setError] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage);

  const handleSave = async (field: Field) => {
    if (updatingField && !field.id) return;
    try {
      setUpdatingField(true);
      setError(null);

      // Get the current has_fence value
      const hasFence = editingValues.has_fence ?? field.has_fence ?? null;
      
      // Update local state immediately for better UX
      const updatedField = {
        ...editingValues,
      };

      setLocalFields(prevFields => 
        prevFields.map(f => f.id === field.id ? updatedField : f)
      );
      
      // Send update to server
      await updateField(field.id, {
        name: editingValues.name || field.name,
        latitude: editingValues.latitude || field.latitude,
        longitude: editingValues.longitude || field.longitude,
        has_fence: hasFence
      });
      
      // Refresh projects to ensure sync - wait for the update to complete
      const updatedProjects = await fetchProjects();
      onProjectsChange(updatedProjects);
      
      setEditingId(null);
      setEditingValues({});
      setError(null);
    } catch (err) {
      console.error('Error saving field:', err);
      setError(err instanceof Error ? err.message : 'Failed to save field');
    } finally {
      setUpdatingField(false);
    }
  };

  const handleAddField = async () => {
    if (!newValues.name?.trim()) {
      setError('Field name is required');
      return;
    }

    // Validate has_fence value
    if (!['yes', 'no'].includes(newValues.has_fence)) {
      setError('Invalid fence value');
      return;
    }

    try {
      setError(null);
      await createField(selectedProjectId, {
        name: newValues.name.trim(),
        latitude: newValues.latitude || undefined,
        longitude: newValues.longitude || undefined,
        has_fence: newValues.has_fence as 'yes' | 'no'
      });

      // Fetch fresh project data
      const updatedProjects = await fetchProjects(null);
      onProjectsChange(updatedProjects);

      setIsAdding(false);
      setNewValues({
        name: '',
        latitude: '',
        longitude: '',
        has_fence: 'no'
      });
      setError(null);
    } catch (err) {
      console.error('Error creating field:', err);
      setError(err instanceof Error ? err.message : 'Failed to create field');
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
    <div>
      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-3 px-4 mb-4 flex items-center justify-center gap-x-2 text-sm text-white rounded bg-accent-primary"
      >
        <Plus size={16} />
        {translation("field.add")}
      </button>

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
          {isAdding && (
            <tr>
              <td className="p-2 border border-theme">
                <FormHandler
                  isEditing={true}
                  onSave={handleAddField}
                  onCancel={() => {
                    setIsAdding(false);
                    setNewValues({
                      name: '',
                      latitude: '',
                      longitude: '',
                      has_fence: 'no'
                    });
                  }}
                >
                  <input
                    type="text"
                    value={newValues.name}
                    onChange={(e) => setNewValues({ ...newValues, name: e.target.value })}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder="Enter field name"
                  />
                </FormHandler>
              </td>
              <td className="p-2 border border-theme">
                <select
                  value={newValues.has_fence}
                  onChange={(e) => setNewValues({ ...newValues, has_fence: e.target.value })}
                  className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                  required
                >
                  <option value="no">{translation("field.has_fence.no")}</option>
                  <option value="yes">{translation("field.has_fence.yes")}</option>
                </select>
              </td>
              <td className="p-2 border border-theme">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newValues.latitude}
                    onChange={(e) => setNewValues({ ...newValues, latitude: e.target.value })}
                    className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder={translation("project.latitude")}
                  />
                  <input
                    type="text"
                    value={newValues.longitude}
                    onChange={(e) => setNewValues({ ...newValues, longitude: e.target.value })}
                    className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder={translation("project.longitude")}
                  />
                </div>
              </td>
              <td className="p-2 border border-theme">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleAddField}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewValues({
                        name: '',
                        latitude: '',
                        longitude: '',
                        has_fence: 'no'
                      });
                    }}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    <X size={14} />
                  </button>
                </div>
              </td>
            </tr>
          )}
          {(initialFields || []).map(field => (
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
                    value={editingValues.has_fence}
                    onChange={(e) => setEditingValues(prev => ({
                      ...prev,
                      has_fence: e.target.value
                    }))}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    disabled={updatingField}
                  >
                    <option value="">Not set</option>
                    <option value="no">{translation("field.has_fence.no")}</option>
                    <option value="yes">{translation("field.has_fence.yes")}</option>
                  </select>
                ) : (
                  <span>
                    {field.has_fence === null ? 'Not set' : 
                     translation(field.has_fence === 'yes' || field.has_fence === true ? "field.has_fence.yes" : "field.has_fence.no")}
                  </span>
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
                    onClick={async (event) => {
                      event.stopPropagation();
                      if (editingId === field.id) {
                        handleSave(field);
                      } else {
                        setEditingId(field.id);
                        setEditingValues({
                          name: field.name,
                          latitude: field.latitude || '',
                          longitude: field.longitude || '',
                          has_fence: field.has_fence === null ? '' : 
                                   field.has_fence === true || field.has_fence === 'yes' ? 'yes' : 'no'
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
      {error && (
        <div className="mt-2 p-2 rounded text-sm text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}
    </div>
  );
};

export default FieldList;