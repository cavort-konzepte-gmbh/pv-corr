import React, { useState } from 'react';
import { Theme } from '../types/theme';
import { Language } from '../types/language';
import { Project } from '../types/projects';
import { Building2, MapPin, User, Mail, Phone, ChevronRight, Edit2, Plus, DoorOpen, X } from 'lucide-react';
import { updateField, createGate, updateGate, deleteGate, deleteField } from '../services/fields';
import { fetchProjects } from '../services/projects';
import { Person } from '../types/people';
import { Company } from '../types/companies';

interface FieldsPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  selectedProjectId?: string;
  onSelectField: (projectId: string, fieldId: string) => void;
  people: Person[],
  companies: Company[]
}

const FieldsPanel: React.FC<FieldsPanelProps> = ({
  currentTheme,
  projects,
  people,
  companies,
  selectedProjectId,
  onSelectField,
  onProjectsChange
}) => {
  const [showGatesPanel, setShowGatesPanel] = useState(false);
  const [showCoordinatesForm, setShowCoordinatesForm] = useState(false);
  const [coordinates, setCoordinates] = useState({ latitude: '', longitude: '' });
  const [gateFormValues, setGateFormValues] = useState({
    name: '',
    latitude: '',
    longitude: ''
  });
  const [editingGate, setEditingGate] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const selectedProject = selectedProjectId 
  ? projects.find(p => p.id === selectedProjectId)
  : null;


  if (!selectedProject) {
    return (
      <div 
        className="p-6 text-center"
        style={{ color: currentTheme.colors.text.secondary }}
      >
        Please select a project to view its fields
      </div>
    );
  }

  const fields = selectedProject.fields;
  const manager = people.find(person => person.id === selectedProject.managerId);
  const company = companies.find(company => company.id === selectedProject.companyId);

  const handleGateSubmit = async (fieldId: string, e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gateFormValues.name || !gateFormValues.latitude || !gateFormValues.longitude) {
      setError('All gate fields are required');
      return;
    }

    try {
      if (editingGate) {
        await updateGate(editingGate.id, gateFormValues);
      } else {
        await createGate(fieldId, gateFormValues);
      }

      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setShowGatesPanel(false);
      setGateFormValues({ name: '', latitude: '', longitude: '' });
      setEditingGate(null);
    } catch (err) {
      console.error('Error saving gate:', err);
      setError('Failed to save gate');
    }
  };

  const handleDeleteGate = async (gateId: string) => {
    try {
      await deleteGate(gateId);
      
      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }
    } catch (err) {
      console.error('Error deleting gate:', err);
      setError('Failed to delete gate');
    }
  };

  const handleCoordinatesSubmit = async (fieldId: string, e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateField(fieldId, coordinates);
      
      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setShowCoordinatesForm(false);
      setCoordinates({ latitude: '', longitude: '' });
    } catch (err) {
      console.error('Error updating coordinates:', err);
      setError('Failed to update coordinates');
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

      setShowDeleteConfirm(false);
      setDeleteConfirmName('');
    } catch (err) {
      console.error('Error deleting field:', err);
      setError('Failed to delete field');
    }
  };

  return (
    <div className="p-6">
      {error && (
        <div className="p-4 mb-4 rounded text-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      {/* Project Summary */}
      <div className="p-6 rounded-lg mb-8 border-theme border-solid bg-surface">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="text-2xl font-mono mb-6 text-primary">
              {selectedProject.name}
              {selectedProject.typeProject && (
                <span className="ml-2 text-lg font-normal text-primary">
                  ({selectedProject.typeProject})
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {selectedProject.clientRef && (
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 flex items-center justify-center rounded bg-accent-primary">
                    <span className="text-xs text-white font-mono">#</span>
                  </div>
                  <div>
                    <div className="font-medium text-secondary">
                      {selectedProject.clientRef}
                    </div>
                    <div className="text-sm text-secondary">
                      Project Reference
                    </div>
                  </div>
                </div>
              )}

              {selectedProject.companyId && (
                <div className="flex items-start gap-2">
                  <Building2 className="text-accent-primary" size={16} />
                  <div>
                    <div className="font-medium text-secondary">
                      {company?.name}
                    </div>
                    <div className="text-sm text-secondary">
                      Construction Company
                    </div>
                  </div>
                </div>
              )}

              {selectedProject.managerId && (
                <div className="flex items-start gap-2">
                  <User className="text-accent-primary" size={16} />
                  <div>
                    <div className="font-medium text-primary">
                      {manager?.firstName} {manager?.lastName}
                    </div>
                    <div className="text-sm text-secondary">
                      Project Manager
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="text-accent-primary" size={14} />
                        <a 
                          href="mailto:manager@example.com"
                          className="text-accent-primary"                        
                        >
                          {manager?.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="text-accent-primary" size={14} />
                        <a 
                          href="tel:+1234567890"
                          className="text-accent-primary"
                        >
                          {manager?.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedProject.latitude && selectedProject.longitude) && (
                <div className="flex items-start gap-2">
                  <MapPin className="text-accent-primary"size={16} />
                  <div>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps?q=${selectedProject.latitude},${selectedProject.longitude}`, '_blank')}
                      className="text-sm hover:underline text-accent-primary"
                    >
                      {selectedProject.latitude}, {selectedProject.longitude}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {selectedProject.imageUrl && (
            <div className="ml-6 flex-shrink-0">
              <img 
                src={selectedProject.imageUrl} 
                alt={selectedProject.name}
                className="w-[300px] h-[200px] rounded-lg shadow-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(field => (
          <div
            key={field.id}
            className="p-4 rounded-lg transition-all hover:translate-y-[-2px] border-theme border-solid shadow-border bg-surface hover:cursor-pointer"
            onClick={() => onSelectField(selectedProject.id, field.id)}            
          >
            <div className="flex items-center justify-between mb-2">
              <h3 
                className="font-medium text-primary"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <span>{field.name}</span>
                </div>
              </h3>
              <ChevronRight className="text-secondary" size={16} />
            </div>
            <div className="flex justify-between items-center" onClick={e => e.stopPropagation()}>
              <span className="text-sm text-secondary">
                {field.zones.length} zones • {
                  field.zones.reduce((acc, zone) => acc + (zone.datapoints?.length || 0), 0)
                } datapoints
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
                      setShowCoordinatesForm(true);
                      setCoordinates({
                        latitude: field.latitude || '',
                        longitude: field.longitude || ''
                      });
                    }}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGatesPanel(true);
                }}
                className="text-sm flex items-center gap-1 text-secondary"
              >
                <Plus size={14} />
                Add Gate
              </button>
              {field.gates?.map(gate => (
                <div
                  key={gate.id}
                  className="flex items-center gap-1"
                  onClick={e => e.stopPropagation()}
                >
                  <DoorOpen className="text-accent-primary" size={14} />
                  <span className="text-sm text-primary">
                    {gate.name}
                  </span>
                  <button
                    onClick={() => {
                      setEditingGate(gate);
                      setGateFormValues({
                        name: gate.name,
                        latitude: gate.latitude,
                        longitude: gate.longitude
                      });
                      setShowGatesPanel(true);
                    }}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteGate(gate.id)}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Gates Panel */}
      {showGatesPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-4 text-primary">
              {editingGate ? 'Edit Gate' : 'Add New Gate'}
            </h3>
            <form onSubmit={(e) => handleGateSubmit(selectedField.id, e)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Gate Name
                </label>
                <input
                  type="text"
                  value={gateFormValues.name}
                  onChange={(e) => setGateFormValues(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Latitude
                </label>
                <input
                  type="text"
                  value={gateFormValues.latitude}
                  onChange={(e) => setGateFormValues(prev => ({ ...prev, latitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Longitude
                </label>
                <input
                  type="text"
                  value={gateFormValues.longitude}
                  onChange={(e) => setGateFormValues(prev => ({ ...prev, longitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGatesPanel(false);
                    setGateFormValues({ name: '', latitude: '', longitude: '' });
                    setEditingGate(null);
                  }}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"                  
                >
                  {editingGate ? 'Save Changes' : 'Add Gate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coordinates Form */}
      {showCoordinatesForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-4 text-primary">
              {coordinates.latitude && coordinates.longitude ? 'Edit Coordinates' : 'Add Coordinates'}
            </h3>
            <form onSubmit={(e) => handleCoordinatesSubmit(selectedField.id, e)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Latitude
                </label>
                <input
                  type="text"
                  value={coordinates.latitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, latitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                  
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Longitude
                </label>
                <input
                  type="text"
                  value={coordinates.longitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, longitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                  
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCoordinatesForm(false)}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"                  
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"                  
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-4 text-primary">
              Delete Field
            </h3>
            <p className="mb-4 text-secondary">
              This action cannot be undone. Please type the field name to confirm deletion.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Type field name to confirm"
                className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmName('');
                  }}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"                  
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmName === field.name) {
                      handleDeleteField(field.id);
                    }
                  }}
                  disabled={deleteConfirmName !== field.name}
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                  style={{
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
    </div>
  );
};

export default FieldsPanel;