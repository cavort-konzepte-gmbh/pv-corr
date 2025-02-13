import React, { useState } from 'react';
import { Project } from '../../types/projects';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Plus, MapPin, User, Mail, Phone, Building2, X, DoorOpen, Maximize2, Folder } from 'lucide-react';
import { SavedPlace } from '../PlacesPanel';
import { Company } from '../../types/companies';
import { createField } from '../../services/fields';
import { fetchProjects } from '../../services/projects';
import { Person } from '../../types/people';

interface ProjectViewProps {
  project: Project;
  currentTheme: Theme;
  currentLanguage: Language;
  showHiddenIds: boolean;
  savedPlaces: SavedPlace[];
  savedPeople: Person[];
  savedCompanies: Company[];
  onFieldSelect: (fieldId: string) => void;
  onAddField: () => void;
  onProjectsChange: (projects: Project[]) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({
  project,
  currentTheme,
  currentLanguage,
  showHiddenIds,
  savedPlaces,
  savedPeople,
  savedCompanies,
  onFieldSelect,
  onAddField,
  onProjectsChange
}) => {
  const t = useTranslation(currentLanguage);
  const projectPlace = project.placeId ? savedPlaces.find(p => p.id === project.placeId) : null;
  const projectManager = project.managerId ? savedPeople.find(p => p.id === project.managerId) : null;
  const projectCompany = savedCompanies.find(c => c.id === project.companyId);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [showNewFieldDialog, setShowNewFieldDialog] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingFieldName, setEditingFieldName] = useState('');
  const [newFieldError, setNewFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteFieldConfirm, setShowDeleteFieldConfirm] = useState<string | null>(null);
  const [deleteFieldConfirmName, setDeleteFieldConfirmName] = useState('');
  const [showFieldCoordinatesForm, setShowFieldCoordinatesForm] = useState(false);
  const [fieldCoordinates, setFieldCoordinates] = useState({
    fieldId: '',
    latitude: '',
    longitude: ''
  });

  const openInMaps = (latitude: string, longitude: string) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  const handleCreateField = async () => {
    if (isSaving) return;
    if (!newFieldName.trim()) {
      setNewFieldError('Field name is required');
      return;
    }

    try {
      setIsSaving(true);
      const newField = await createField(project.id, {
        name: newFieldName.trim(),
        latitude: '',
        longitude: ''
      });
      
      // Fetch fresh projects data to ensure everything is in sync
      const updatedProjects = await fetchProjects();
      if (!updatedProjects) {
        throw new Error('Failed to refresh projects data');
      }

      // Update the projects state with fresh data
      onProjectsChange(updatedProjects);
      
      // Reset form state
      setShowNewFieldDialog(false);
      setNewFieldName('');
      setNewFieldError(null);

      // Select the newly created field
      onFieldSelect(newField.id);
    } catch (error) {
      console.error('Error creating field:', error);
      setNewFieldError('Failed to create field');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditField = (field: Field) => {
    setEditingFieldId(field.id);
    setEditingFieldName(field.name);
  };

  const handleSaveFieldName = async () => {
    if (!editingFieldId || !editingFieldName.trim()) {
      setNewFieldError('Field name is required');
      return;
    }

    try {
      await updateField(editingFieldId, { name: editingFieldName.trim() });
      
      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setEditingFieldId(null);
      setEditingFieldName('');
    } catch (err) {
      console.error('Error updating field:', err);
      setNewFieldError('Failed to update field name');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      await deleteField(fieldId);
      
      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setShowDeleteFieldConfirm(null);
      setDeleteFieldConfirmName('');
    } catch (err) {
      console.error('Error deleting field:', err);
      setNewFieldError('Failed to delete field');
    }
  };

  const handleUpdateFieldCoordinates = async () => {
    if (!fieldCoordinates.fieldId) return;

    try {
      await updateField(fieldCoordinates.fieldId, {
        latitude: fieldCoordinates.latitude,
        longitude: fieldCoordinates.longitude
      });

      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setShowFieldCoordinatesForm(false);
      setFieldCoordinates({ fieldId: '', latitude: '', longitude: '' });
    } catch (err) {
      console.error('Error updating field coordinates:', err);
      setNewFieldError('Failed to update coordinates');
    }
  };

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
          {t('project.not_found')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div
        className="p-6 rounded-lg mb-8 relative overflow-hidden"
        style={{ 
          backgroundColor: currentTheme.colors.surface, 
          border: `1px solid ${currentTheme.colors.border}`
        }}
      >
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="text-2xl font-mono mb-6" style={{ color: currentTheme.colors.text.primary }}>
              {project.name}
              {showHiddenIds && (
                <span className="text-xs opacity-50 ml-2" style={{ color: currentTheme.colors.text.secondary }}>
                  {project.hiddenId}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4">
          {project.clientRef && (
            <div className="flex items-start gap-2">
              <div 
                className="w-4 h-4 flex items-center justify-center rounded"
                style={{ backgroundColor: currentTheme.colors.accent.primary }}
              >
                <span className="text-xs text-white font-mono">#</span>
              </div>
              <div>
                <div className="font-medium" style={{ color: currentTheme.colors.text.primary }}>
                  {project.clientRef}
                </div>
                <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                  Project Reference
                </div>
              </div>
            </div>
          )}

            {projectCompany && (
              <div className="flex items-start gap-2">
                <Building2 size={16} style={{ color: currentTheme.colors.accent.primary }} />
                <div>
                  <div className="font-medium" style={{ color: currentTheme.colors.text.primary }}>
                    {projectCompany.name}
                  </div>
                  <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                    Construction Company
                    {projectCompany.vatId && ` • VAT ID: ${projectCompany.vatId}`}
                  </div>
                </div>
              </div>
            )}

            {projectManager && (
              <div className="flex items-start gap-2">
                <User size={16} style={{ color: currentTheme.colors.accent.primary }} />
                <div>
                  <div className="font-medium" style={{ color: currentTheme.colors.text.primary }}>
                    {projectManager?.title ? `${projectManager?.title} ` : ''}
                    {projectManager?.firstName} {projectManager?.lastName}
                  </div>
                  <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                    Project Manager
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} style={{ color: currentTheme.colors.accent.primary }} />
                      <a 
                        href={`mailto:${projectManager.email}`}
                        style={{ color: currentTheme.colors.accent.primary }}
                      >
                        {projectManager.email}
                      </a>
                    </div>
                    {projectManager.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} />
                        <a 
                          href={`tel:${projectManager.phone}`}
                          style={{ color: currentTheme.colors.accent.primary }}
                        >
                          {projectManager.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(project.latitude && project.longitude) && (
              <div className="flex items-start gap-2">
                <MapPin size={16} style={{ color: currentTheme.colors.accent.primary }} />
                <div>
                  <button
                    onClick={() => openInMaps(project.latitude!, project.longitude!)}
                    className="text-sm hover:underline"
                    style={{ color: currentTheme.colors.accent.primary }}
                  >
                    {project.latitude}, {project.longitude}
                  </button>
                  {project.fields.some(field => (field.gates || []).length > 0) && (
                    <div className="mt-2">
                      <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                        Project Gates:
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {project.fields.map(field => 
                          (field.gates || []).map(gate => (
                            <button
                              key={`${field.id}-${gate.id}`}
                              onClick={() => openInMaps(gate.latitude, gate.longitude)}
                              className="flex items-center gap-2 text-sm hover:underline ml-4"
                              style={{ color: currentTheme.colors.accent.primary }}
                            >
                              <DoorOpen size={14} />
                              {field.name} • {gate.name} ({gate.latitude}, {gate.longitude})
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>
          {project.imageUrl && (
            <div className="ml-6 flex-shrink-0">
              <div className="relative group">
                <img 
                  src={project.imageUrl} 
                  alt={project.name}
                  className="rounded-lg shadow-lg object-cover cursor-pointer"
                  style={{ width: '300px', height: '200px' }}
                  onClick={() => setShowFullscreenImage(true)}
                />
                <button
                  className="absolute top-2 right-2 p-1 rounded bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setShowFullscreenImage(true)}
                  style={{ color: 'white' }}
                >
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showFullscreenImage && project.imageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowFullscreenImage(false)}
        >
          <img 
            src={project.imageUrl} 
            alt={project.name}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          <button
            className="absolute top-4 right-4 p-2 rounded hover:bg-white hover:bg-opacity-10"
            onClick={() => setShowFullscreenImage(false)}
            style={{ color: 'white' }}
          >
            <X size={24} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-opacity-10 bg-white rounded p-4">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-mono" style={{ color: currentTheme.colors.text.primary }}>
              {project.fields.length}
            </div>
            <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>{t('project.fields')}</div>
          </div>
        </div>
        <div className="bg-opacity-10 bg-white rounded p-4">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-mono" style={{ color: currentTheme.colors.text.primary }}>
              {project.fields.reduce((acc, field) => acc + field.zones.length, 0)}
            </div>
            <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>{t('project.zones')}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {project.fields.map(field => (
          <div
            key={field.id}
            className="p-4 rounded cursor-pointer transition-all duration-200 hover:translate-x-1"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              border: `1px solid ${currentTheme.colors.border}`,
              boxShadow: `0 2px 4px ${currentTheme.colors.border}`
            }}
            onClick={() => onFieldSelect(field.id)}
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
                  <span>{field.name}</span>
                  {field.gates && field.gates.length > 0 && (
                    <span className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                      • {field.gates.length} gates
                    </span>
                  )}
                </div>
              </h3>
              <span 
                className="text-sm font-mono"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                {field.zones.length} {t('project.zones')}
              </span>
            </div>
            <div className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
              {field.zones.reduce((acc, zone) => acc + (zone.datapoints?.length || 0), 0)} {t('project.datapoints')}
            </div>
          </div>
        ))}
        <button
          onClick={async () => {
            setShowNewFieldDialog(true);
          }}
          className="p-4 rounded font-mono text-sm transition-all duration-200 hover:translate-y-[-1px] w-full text-left"
          style={{
            backgroundColor: 'transparent',
            color: currentTheme.colors.text.primary,
            border: `1px dashed ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-2">
            <Folder size={16} style={{ color: currentTheme.colors.accent.primary }} />
            {t('field.new')}
          </div>
        </button>

        {showNewFieldDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              className="p-6 rounded-lg max-w-md w-full"
              style={{ backgroundColor: currentTheme.colors.surface }}
            >
              <h3 
                className="text-lg mb-4 flex items-center gap-2"
                style={{ color: currentTheme.colors.text.primary }}
              >
                <Folder size={20} style={{ color: currentTheme.colors.accent.primary }} />
                {t('field.new')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label 
                    className="block text-sm mb-1"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    {t('field.name')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="w-full p-2 rounded text-sm"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      border: `1px solid ${currentTheme.colors.border}`,
                      color: currentTheme.colors.text.primary
                    }}
                    autoFocus
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       e.preventDefault();
                       handleCreateField();
                     }
                   }}
                  />
                  {newFieldError && (
                    <p className="text-sm mt-1" style={{ color: currentTheme.colors.accent.primary }}>
                      {newFieldError}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowNewFieldDialog(false);
                      setNewFieldName('');
                      setNewFieldError(null);
                    }}
                    className="px-4 py-2 rounded text-sm"
                    style={{
                      backgroundColor: 'transparent',
                      color: currentTheme.colors.text.secondary,
                      border: `1px solid ${currentTheme.colors.border}`
                    }}
                  >
                    {t('actions.cancel')}
                  </button>
                  <button
                    onClick={handleCreateField}
                    className="px-4 py-2 rounded text-sm"
                    style={{
                      backgroundColor: currentTheme.colors.accent.primary,
                      color: 'white'
                    }}
                  >
                    {t('actions.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;