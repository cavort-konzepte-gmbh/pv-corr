import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { Project } from '../types/projects';
import { Folder, Plus, ChevronRight, Trash2, MapPin, User, Building2, DoorOpen, Edit2, X } from 'lucide-react';
import { SavedPlace } from './PlacesPanel';
import { Person } from '../types/people';
import { fetchPeople } from '../services/people';
import { Company } from '../types/companies';
import { generateHiddenId } from '../utils/generateHiddenId';
import { createProject, updateProject, deleteProject, fetchProjects } from '../services/projects';

interface ProjectsPanelProps {
  currentTheme: Theme;
  projects: Project[];
  savedPlaces: SavedPlace[];
  savedPeople: Person[];
  savedCompanies: Company[];
  onProjectsChange: (projects: Project[]) => void;
}

const ProjectsPanel: React.FC<ProjectsPanelProps> = ({
  currentTheme,
  projects,
  savedPlaces,
  savedPeople,
  savedCompanies,
  onProjectsChange
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [clientRef, setClientRef] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [availablePeople, setAvailablePeople] = useState<Person[]>([]);
  const [peopleSearch, setPeopleSearch] = useState('');
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [typeProject, setTypeProject] = useState<'roof' | 'field'>('field');
  useEffect(() => {
    const searchTerm = peopleSearch.toLowerCase();
    const filtered = availablePeople.filter(person => 
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm) ||
      person.email.toLowerCase().includes(searchTerm) ||
      (person.title && person.title.toLowerCase().includes(searchTerm))
    );
    setFilteredPeople(filtered);
  }, [peopleSearch, availablePeople]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const [fetchedProjects, fetchedPeople] = await Promise.all([
          fetchProjects(),
          fetchPeople()
        ]);
        
        setProjectsList(fetchedProjects);
        setAvailablePeople(fetchedPeople);
        onProjectsChange(fetchedProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    // Prepare project data
    const projectData = {
      name: projectName,
      hiddenId: generateHiddenId(),
      clientRef: clientRef || undefined,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      imageUrl: imageUrl || undefined,
      placeId: selectedPlaceId || undefined,
      managerId: selectedManagerId || undefined,
      typeProject: typeProject || 'field',
      companyId: undefined // Add if needed
    };

    if (editingProject) {
      try {
        // Preserve existing fields and update with new data
        const updatedProject = await updateProject({
          ...editingProject,
          ...projectData,
          fields: editingProject.fields // Keep existing fields
        });

        const updatedProjects = projectsList.map(p =>
          p.id === editingProject.id ? { ...p, ...updatedProject } : p
        );
        onProjectsChange(updatedProjects);
        setProjectsList(updatedProjects);
        setError(null);
      } catch (error) {
        console.error('Failed to update project:', error);
        setError('Failed to update project');
        return;
      }
    } else {
      try {
        const newProject = await createProject(projectData);
        const updatedProjects = [...projectsList, { ...newProject, fields: [], gates: [] }];
        onProjectsChange(updatedProjects);
        setProjectsList(updatedProjects);
        setError(null);
      } catch (error) {
        console.error('Failed to create project:', error);
        setError('Failed to create project');
        return;
      }
    }

    setShowNewProjectForm(false);
    setEditingProject(null);
    setProjectName('');
    setSelectedPlaceId('');
    setClientRef('');
    setLatitude('');
    setLongitude('');
    setImageUrl('');
    setSelectedManagerId(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setProjectName(project.name);
    setSelectedPlaceId(project.placeId || null);
    setClientRef(project.clientRef || '');
    setLatitude(project.latitude || '');
    setLongitude(project.longitude || '');
    setImageUrl(project.imageUrl || '');
    setSelectedManagerId(project.managerId || null);
    setTypeProject(project.typeProject === 'roof' || project.typeProject === 'field' ? project.typeProject : 'field');
    setShowNewProjectForm(true);
  };

  const handleDelete = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      const updatedProjects = projectsList.filter(p => p.id !== projectId);
      onProjectsChange(updatedProjects);
      setProjectsList(updatedProjects);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
    setShowDeleteConfirm(null);
    setDeleteConfirmName('');
  };

  const openInMaps = (latitude: string, longitude: string) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  return (
    <div className="p-6">
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
          Loading projects...
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6"
            style={{ 
              backgroundColor: currentTheme.colors.accent.primary,
              color: 'white'
            }}
          >
            <Plus size={16} />
            Add New Project
          </button>

          {showNewProjectForm ? (
            <div>
              <h3 
                className="text-lg mb-6 flex items-center gap-2"
                style={{ color: currentTheme.colors.text.primary }}
              >
                <Folder size={16} style={{ color: currentTheme.colors.accent.primary }} />
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      className="block text-sm mb-1"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      Project Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
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
                    <label 
                      className="block text-sm mb-1"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      Project Site
                    </label>
                    <select
                      value={selectedPlaceId || ''}
                      onChange={(e) => setSelectedPlaceId(e.target.value || null)}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.primary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    >
                      <option value="">No site assigned</option>
                      {savedPlaces.map(place => (
                        <option key={place.id} value={place.id}>
                          {place.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label 
                      className="block text-sm mb-1"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      Client Ref
                    </label>
                    <input
                      type="text"
                      placeholder="Enter client reference"
                      value={clientRef}
                      onChange={(e) => setClientRef(e.target.value)}
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
                    <label 
                      className="block text-sm mb-1"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      Project Manager
                    </label>
                    <input
                      type="text"
                      placeholder="Search people..."
                      value={peopleSearch}
                      onChange={(e) => setPeopleSearch(e.target.value)}
                      className="w-full p-2 rounded text-sm mb-2"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.primary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    />
                    <select
                      value={selectedManagerId || ''}
                      onChange={(e) => setSelectedManagerId(e.target.value || null)}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.primary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    >
                      <option value="">No manager assigned</option>
                      {filteredPeople.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.title ? `${person.title} ` : ''}
                          {person.firstName} {person.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                 
                  <div>
                    <label 
                      className="block text-sm mb-1"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      Latitude
                    </label>
                    <input
                      type="text"
                      placeholder="Enter latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
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
                    <label 
                      className="block text-sm mb-1"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      Longitude
                    </label>
                    <input
                      type="text"
                      placeholder="Enter longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
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
                    <label 
                      className="block text-sm mb-1"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      Project Type
                    </label>
                    <select
                      value={typeProject}
                      onChange={(e) => setTypeProject(e.target.value as 'roof' | 'field')}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.primary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    >
                      <option value="field">Field</option>
                      <option value="roof">Roof</option>
                    </select>
                  </div>
                  <div>
                    <label 
                      className="block text-sm mb-1"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      Project Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="Enter image URL (e.g. https://images.unsplash.com/...)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.primary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewProjectForm(false);
                      setEditingProject(null);
                      setProjectName('');
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
                    {editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {projectsList.map(project => (
                <div
                  key={project.id}
                  className="p-4 rounded-lg border transition-all hover:translate-x-1"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Folder size={16} style={{ color: currentTheme.colors.accent.primary }} />
                      <span className="font-medium">{project.name}</span>
                      {project.managerId && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                          <User size={12} />
                          <div className="flex flex-col gap-1">
                            {(() => {
                              const manager = availablePeople.find(p => p.id === project.managerId);
                              if (!manager) return 'Unknown manager';
                              return (
                                <>
                                  <div>
                                    {manager.title ? `${manager.title} ` : ''}{manager.firstName} {manager.lastName}
                                  </div>
                                  {manager.email && (
                                    <a 
                                      href={`mailto:${manager.email}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:underline"
                                      style={{ color: currentTheme.colors.accent.primary }}
                                    >
                                      {manager.email}
                                    </a>
                                  )}
                                  {manager.phone && (
                                    <a 
                                      href={`tel:${manager.phone}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:underline"
                                      style={{ color: currentTheme.colors.accent.primary }}
                                    >
                                      {manager.phone}
                                    </a>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                      {project.placeId && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                          {savedPlaces && <MapPin size={12} />}
                          {savedPlaces?.find(p => p.id === project.placeId)?.name || 'Unknown location'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1 rounded hover:bg-opacity-80"
                        style={{ color: currentTheme.colors.text.secondary }}
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(project.id)}
                        className="p-1 rounded hover:bg-opacity-80"
                        style={{ color: currentTheme.colors.text.secondary }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    {project.fields.length} fields • {
                      project.fields.reduce((acc, field) => acc + field.zones.length, 0)
                    } zones • {
                      project.fields.reduce((acc, field) => 
                        acc + field.zones.reduce((zAcc, zone) => 
                          zAcc + (zone.datapoints?.length || 0), 0
                        ), 0
                    ) } datapoints • Project Type: {project.typeProject|| 'UNDEFINED'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div 
                className="p-6 rounded-lg max-w-md w-full"
                style={{ backgroundColor: currentTheme.colors.surface }}
              >
                <h3 className="text-lg font-mono mb-4" style={{ color: currentTheme.colors.text.primary }}>
                  Delete Project
                </h3>
                <p className="mb-4" style={{ color: currentTheme.colors.text.secondary }}>
                  This action cannot be undone. Please type the project name to confirm deletion.
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder="Type project name to confirm"
                    className="w-full p-2 rounded text-sm"
                    style={{
                      backgroundColor: currentTheme.colors.surface,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text.primary,
                      border: `1px solid ${currentTheme.colors.border}`
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(null);
                        setDeleteConfirmName('');
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
                      onClick={() => {
                        const project = projectsList.find(p => p.id === showDeleteConfirm);
                        if (project && deleteConfirmName === project.name) {
                          handleDelete(showDeleteConfirm);
                        }
                      }}
                      disabled={deleteConfirmName !== (projectsList.find(p => p.id === showDeleteConfirm)?.name || '')}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.accent.primary,
                        color: 'white',
                        opacity: deleteConfirmName === (projectsList.find(p => p.id === showDeleteConfirm)?.name || '') ? 1 : 0.5
                      }}
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsPanel;