import React, { useState } from 'react';
import { Field, Project } from '../../types/projects';
import { Theme } from '../../types/theme';
import { Edit2, Check, Plus, DoorOpen, MapPin, X, Trash2 } from 'lucide-react';
import { updateField, createGate, updateGate, deleteGate, deleteField } from '../../services/fields';
import { fetchProjects } from '../../services/projects';
import { Language, useTranslation } from '../../types/language';
import { generateHiddenId } from '../../utils/generateHiddenId';
import { Gate } from '../../types/projects';
import { useKeyAction } from '../../hooks/useKeyAction';

interface FieldViewProps {
  project: Project;
  field: Field;
  showHiddenIds: boolean;
  currentTheme: Theme;
  currentLanguage: Language;
  editingName: any;
  newName: string;
  setEditingName: (name: any) => void;
  setNewName: (name: string) => void;
  handleNameEdit: (type: string, projectId: string, id: string, currentName: string, fieldId?: string, e?: React.MouseEvent) => void;
  onZoneSelect: (zoneId: string) => void;
  onAddZone: () => void;
  onProjectsChange: (updatedProject: Project) => void;
}

const FieldView: React.FC<FieldViewProps> = ({ 
  project,
  field,
  showHiddenIds,
  currentTheme,
  currentLanguage,
  editingName,
  newName,
  setEditingName,
  setNewName,
  handleNameEdit,
  onZoneSelect,
  onAddZone,
  onProjectsChange
}) => {
  const t = useTranslation(currentLanguage);
  const [error, setError] = useState<string | null>(null);
  const [showNewZoneForm, setShowNewZoneForm] = useState(false);
  const [showGatesPanel, setShowGatesPanel] = useState(false);
  const [editingGate, setEditingGate] = useState<Gate | null>(null);
  const [gateFormValues, setGateFormValues] = useState({
    name: '',
    latitude: '',
    longitude: ''
  });
  const [showCoordinatesForm, setShowCoordinatesForm] = useState(false);
  const [coordinates, setCoordinates] = useState({
    latitude: field.latitude || '',
    longitude: field.longitude || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const addGate = async () => {
    if (isSaving) return;
    
    if (!gateFormValues.name || !gateFormValues.latitude || !gateFormValues.longitude) return;
    setError(null);

    try {
      setIsSaving(true);
      if (editingGate) {
        // Update existing gate
        await updateGate(editingGate.id, {
          name: gateFormValues.name,
          latitude: gateFormValues.latitude,
          longitude: gateFormValues.longitude
        });
      } else {
        // Create new gate
        await createGate(field.id, {
          name: gateFormValues.name,
          latitude: gateFormValues.latitude,
          longitude: gateFormValues.longitude
        });
      }

      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      // Reset form
      setGateFormValues({ name: '', latitude: '', longitude: '' });
      setEditingGate(null);
      setShowGatesPanel(false);
    } catch (err) {
      console.error('Error saving gate:', err);
      setError(err instanceof Error ? err.message : 'Failed to save gate');
    } finally {
      setIsSaving(false);
    }
  }

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addGate();
  };

  const gates = field.gates || [];

  const addCoordinates = async () => {
    if (isSaving) return;
    
    setError(null);

    try {
      setIsSaving(true);
      await updateField(field.id, {
        latitude: coordinates.latitude || undefined,
        longitude: coordinates.longitude || undefined
      });

      // Refresh projects data to get the updated field
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setShowCoordinatesForm(false);
    } catch (err) {
      console.error('Error updating coordinates:', err);
      setError('Failed to update coordinates');
    } finally {
      setIsSaving(false);
    }
  }

  const handleCoordinatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addCoordinates();
  };

  const handleEditGate = (gate: Gate) => {
    setEditingGate(gate);
    setGateFormValues({
      name: gate.name,
      latitude: gate.latitude,
      longitude: gate.longitude
    });
    setShowGatesPanel(true);
  };

  const handleDeleteGate = async (gateId: string) => {
    setError(null);
    try {
      await deleteGate(gateId);
      
      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }
    } catch (err) {
      console.error('Error deleting gate:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete gate');
    }
  };

  const openInMaps = (latitude: string, longitude: string) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  const handleNameSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (showDeleteConfirm) {
      setShowDeleteConfirm(false);
      return;
    }
    
    setError(null);

    const trimmedName = newName.trim();
    if (!field.id || !trimmedName) {
      setError('Field name is required');
      setEditingName(null);
      return;
    }

    try {
      // Update the field in the database
      const updatedField = await updateField(field.id, {
        name: trimmedName
      });

      if (!updatedField) {
        throw new Error('No data returned from field update');
      }

      // Fetch fresh projects data to ensure everything is in sync
      const updatedProjects = await fetchProjects();
      if (!updatedProjects) {
        throw new Error('Failed to refresh projects data');
      }

      // Update the projects state with fresh data
      onProjectsChange(updatedProjects);
      
      // Reset state
      setNewName('');
      setEditingName(null);
      setError(null);
    } catch (err) {
      console.error('Error updating field:', err instanceof Error ? err.message : err);
      setError(err instanceof Error ? err.message : 'Failed to update field name');
      setEditingName(null);
    }
  };

  useKeyAction(() => {
    addGate();
  }, showGatesPanel)

  useKeyAction(() => {
    addCoordinates();
  }, showCoordinatesForm)

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="text-2xl font-mono" style={{ color: currentTheme.colors.text.primary }}>
          {editingName?.id === field.id ? (
            <form onSubmit={handleNameSave} className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-transparent border-b px-1 outline-none font-mono text-2xl"
                style={{ 
                  borderColor: currentTheme.colors.accent.primary,
                  color: currentTheme.colors.text.primary
                }}
                autoFocus
              />
              <button
                type="submit"
                className="p-1 rounded hover:bg-opacity-80"
                style={{ color: currentTheme.colors.accent.primary }}
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 rounded hover:bg-opacity-80"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                <Trash2 size={16} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span>{field.name}</span>
              <button
                onClick={(e) => handleNameEdit('field', project.id, field.id, field.name, undefined, e)}
                className="p-1 rounded hover:bg-opacity-80"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                <Edit2 size={14} />
              </button>
              {showHiddenIds && (
                <span className="text-xs opacity-50" style={{ color: currentTheme.colors.text.secondary }}>
                  {field.hiddenId}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {field.latitude && field.longitude ? (
            <button
              onClick={() => openInMaps(field.latitude!, field.longitude!)}
              className="text-sm flex items-center gap-1 hover:underline"
              style={{ color: currentTheme.colors.accent.primary }}
            >
              <MapPin size={14} />
              {field.latitude}, {field.longitude}
            </button>
          ) : (
            <button
              onClick={() => setShowCoordinatesForm(true)}
              className="text-sm flex items-center gap-1"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              <MapPin size={14} />
              Add coordinates
            </button>
          )}
          {field.latitude && field.longitude && (
            <button
              onClick={() => setShowCoordinatesForm(true)}
              className="text-sm"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
      </div>

      {showCoordinatesForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div 
            className="p-6 rounded-lg max-w-md w-full"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 className="text-lg mb-4" style={{ color: currentTheme.colors.text.primary }}>
              {field.latitude && field.longitude ? 'Edit Coordinates' : 'Add Coordinates'}
            </h3>
            <form onSubmit={handleCoordinatesSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                  Latitude
                </label>
                <input
                  type="text"
                  value={coordinates.latitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, latitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                  Longitude
                </label>
                <input
                  type="text"
                  value={coordinates.longitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, longitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCoordinatesForm(false)}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'transparent',
                    color: currentTheme.colors.text.secondary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.accent.primary,
                    color: 'white'
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg" style={{ color: currentTheme.colors.text.primary }}>
            Field Gates
          </h3>
          <button
            onClick={() => setShowGatesPanel(true)}
            className="px-3 py-1 rounded text-sm flex items-center gap-2"
            style={{ 
              backgroundColor: currentTheme.colors.accent.primary,
              color: 'white'
            }}
          >
            <Plus size={14} />
            Add Gate
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {gates.map(gate => (
            <div
              key={gate.id}
              className="p-4 rounded transition-all hover:translate-y-[-2px]"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DoorOpen size={16} style={{ color: currentTheme.colors.accent.primary }} />
                  <span className="font-medium" style={{ color: currentTheme.colors.text.primary }}>
                    {gate.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditGate(gate)}
                    className="p-1 rounded hover:bg-opacity-80"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteGate(gate.id)}
                    className="p-1 rounded hover:bg-opacity-80"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => openInMaps(gate.latitude, gate.longitude)}
                className="text-sm flex items-center gap-1 mt-2 hover:underline"
                style={{ color: currentTheme.colors.accent.primary }}
              >
                <MapPin size={12} />
                {gate.latitude}, {gate.longitude}
              </button>
            </div>
          ))}
        </div>
      </div>

      {showGatesPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div 
            className="p-6 rounded-lg max-w-md w-full"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 className="text-lg mb-4" style={{ color: currentTheme.colors.text.primary }}>
              {editingGate ? 'Edit Gate' : 'Add New Gate'}
            </h3>
            <form onSubmit={handleGateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                  Gate Name
                </label>
                <input
                  type="text"
                  value={gateFormValues.name}
                  onChange={(e) => setGateFormValues(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                  Latitude
                </label>
                <input
                  type="text"
                  value={gateFormValues.latitude}
                  onChange={(e) => setGateFormValues(prev => ({ ...prev, latitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                  Longitude
                </label>
                <input
                  type="text"
                  value={gateFormValues.longitude}
                  onChange={(e) => setGateFormValues(prev => ({ ...prev, longitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGatesPanel(false);
                    setEditingGate(null);
                    setGateFormValues({ name: '', latitude: '', longitude: '' });
                  }}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'transparent',
                    color: currentTheme.colors.text.secondary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.accent.primary,
                    color: 'white'
                  }}
                >
                  {editingGate ? 'Save Changes' : 'Add Gate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-opacity-10 bg-white rounded p-4">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-mono" style={{ color: currentTheme.colors.text.primary }}>
              {field.zones.length}
            </div>
            <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>{t('project.zones')}</div>
          </div>
        </div>
        <div className="bg-opacity-10 bg-white rounded p-4">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-mono" style={{ color: currentTheme.colors.text.primary }}>
              {field.zones.reduce((acc, zone) => acc + (zone.datapoints?.length || 0), 0)}
            </div>
            <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>{t('project.datapoints')}</div>
          </div>
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg max-w-md w-full"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 
              className="text-lg mb-4 flex items-center gap-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              <Trash2 size={20} style={{ color: currentTheme.colors.accent.primary }} />
              Delete Field
            </h3>
            
            <p className="mb-4" style={{ color: currentTheme.colors.text.secondary }}>
              This action cannot be undone. Please type the field name <strong>{field.name}</strong> to confirm deletion.
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Type field name to confirm"
                className="w-full p-2 rounded text-sm"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  border: `1px solid ${currentTheme.colors.border}`,
                  color: currentTheme.colors.text.primary
                }}
                autoFocus
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmName('');
                    setEditingName(null);
                  }}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'transparent',
                    color: currentTheme.colors.text.secondary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (deleteConfirmName === field.name) {
                      try {
                        await deleteField(field.id);
                        const updatedProjects = await fetchProjects();
                        if (updatedProjects) {
                          onProjectsChange(updatedProjects);
                        }
                      } catch (err) {
                        console.error('Error deleting field:', err);
                        setError('Failed to delete field');
                      }
                    }
                  }}
                  disabled={deleteConfirmName !== field.name}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.accent.primary,
                    color: 'white',
                    opacity: deleteConfirmName === field.name ? 1 : 0.5
                  }}
                >
                  Delete Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {field.zones.map(zone => (
          <div
            key={zone.id}
            className="p-4 rounded cursor-pointer transition-all duration-200 hover:translate-x-1"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              border: `1px solid ${currentTheme.colors.border}`,
              boxShadow: `0 2px 4px ${currentTheme.colors.border}`
            }}
            onClick={() => onZoneSelect(zone.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 
                className="font-mono text-lg flex items-center"
                style={{ color: currentTheme.colors.text.primary }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.accent.primary }}
                  />
                  <span>{zone.name}</span>
                </div>
              </h3>
              <div className="flex items-center gap-2">
                {zone.latitude && zone.longitude && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInMaps(zone.latitude!, zone.longitude!);
                    }}
                    className="text-sm flex items-center gap-1 hover:underline"
                    style={{ color: currentTheme.colors.accent.primary }}
                  >
                    <MapPin size={14} />
                    {zone.latitude}, {zone.longitude}
                  </button>
                )}
                <span 
                  className="text-sm font-mono"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  {zone.datapoints?.length || 0} datapoints
                </span>
              </div>
            </div>
            <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
              {project.name} / {field.name}
            </div>
          </div>
        ))}
        <button
          onClick={onAddZone}
          className="p-4 rounded font-mono text-sm transition-all duration-200 hover:translate-y-[-1px] w-full text-left"
          style={{
            backgroundColor: 'transparent',
            color: currentTheme.colors.text.primary,
            border: `1px dashed ${currentTheme.colors.border}`
          }}
        >
          + {t('zone.new')}
        </button>
      </div>
    </div>
  );
};

export default FieldView;