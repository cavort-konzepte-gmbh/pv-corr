import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { Project } from '../types/projects';
import { Folder, Plus, ChevronRight, MapPin } from 'lucide-react';
import { SavedPlace } from './PlacesPanel';
import { Person } from '../types/people';
import { Company } from '../types/companies';
import { generateHiddenId } from '../utils/generateHiddenId';
import { createProject, updateProject, deleteProject, fetchProjects } from '../services/projects';

interface ProjectsPanelProps {
  currentTheme: Theme;
  projects: Project[];
  savedPlaces: SavedPlace[];
  savedPeople: Person[];
  savedCompanies: Company[];
  onSelectProject: (projectId: string) => void;
}

const ProjectsPanel: React.FC<ProjectsPanelProps> = ({
  currentTheme,
  projects,
  savedPlaces,
  savedPeople,
  savedCompanies,
  onSelectProject
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [clientRef, setClientRef] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [typeProject, setTypeProject] = useState<'roof' | 'field'>('field');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [peopleSearch, setPeopleSearch] = useState('');
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [availablePeople, setAvailablePeople] = useState<Person[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await fetchProjects();
        setProjectsList(fetchedProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    const searchTerm = peopleSearch.toLowerCase();
    const filtered = availablePeople.filter(person => 
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm) ||
      person.email.toLowerCase().includes(searchTerm) ||
      (person.title && person.title.toLowerCase().includes(searchTerm))
    );
    setFilteredPeople(filtered);
  }, [peopleSearch, availablePeople]);

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
      typeProject: typeProject, 
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
    setTypeProject('field');
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
        <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-4 text-secondary">
          Loading projects...
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6 text-white bg-accent-primary"            
          >
            <Plus size={16} />
            Add New Project
          </button>

          {showNewProjectForm ? (
            <div>
              <h3 className="text-lg mb-6 flex items-center gap-2 text-primary">
                <Folder className="text-accent-primary" size={16} />
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-secondary">
                      Project Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                      className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                      
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-secondary">
                      Project Site
                    </label>
                    <select
                      value={selectedPlaceId || ''}
                      onChange={(e) => setSelectedPlaceId(e.target.value || null)}
                      className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                      
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
                    <label className="block text-sm mb-1 text-secondary">
                      Client Ref
                    </label>
                    <input
                      type="text"
                      placeholder="Enter client reference"
                      value={clientRef}
                      onChange={(e) => setClientRef(e.target.value)}
                      className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                      
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-secondary">
                      Project Manager
                    </label>
                    <input
                      type="text"
                      placeholder="Search people..."
                      value={peopleSearch}
                      onChange={(e) => setPeopleSearch(e.target.value)}
                      className="w-full p-2 rounded text-sm mb-2 text-primary border-theme border-solid bg-surface"                      
                    />
                    <select
                      value={selectedManagerId || ''}
                      onChange={(e) => setSelectedManagerId(e.target.value || null)}
                      className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                      
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
                    <label className="block text-sm mb-1 text-secondary">
                      Latitude
                    </label>
                    <input
                      type="text"
                      placeholder="Enter latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                      
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-secondary">
                      Longitude
                    </label>
                    <input
                      type="text"
                      placeholder="Enter longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                      
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-secondary">
                      Project Type
                    </label>
                    <select
                      value={typeProject}
                      onChange={(e) => setTypeProject(e.target.value as 'roof' | 'field')}
                      className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                      
                    >
                      <option value="field">Field</option>
                      <option value="roof">Roof</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-secondary">
                      Project Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="Enter image URL (e.g. https://images.unsplash.com/...)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                      
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
                    className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-surface"                    
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded text-sm text-white bg-accent-primary"                    
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
                  className="p-4 rounded-lg border transition-all hover:translate-x-1 text-primary border-theme bg-surface"
                  onClick={() => onSelectProject(project.id)}                  
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Folder className="text-accent-primary" size={16} />
                      <span className="font-medium">{project.name}</span>                
                      {project.placeId && (
                        <div className="flex items-center gap-1 text-xs text-secondary">
                          {savedPlaces && <MapPin size={12} />}
                          {savedPlaces?.find(p => p.id === project.placeId)?.name || 'Unknown location'}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="text-secondary" size={16} />
                  </div>
                  <div className="text-sm text-secondary">
                    {project.fields.length} fields • {
                      project.fields.reduce((acc, field) => acc + field.zones.length, 0)
                    } zones • {
                      project.fields.reduce((acc, field) => 
                        acc + field.zones.reduce((zAcc, zone) => 
                          zAcc + (zone.datapoints?.length || 0), 0
                        ), 0
                    ) } datapoints • Project Type: {project.typeProject}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-6 rounded-lg max-w-md w-full bg-surface">
                <h3 className="text-lg font-mono mb-4 text-primary">
                  Delete Project
                </h3>
                <p className="mb-4 text-secondary">
                  This action cannot be undone. Please type the project name to confirm deletion.
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder="Type project name to confirm"
                    className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                    
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(null);
                        setDeleteConfirmName('');
                      }}
                      className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"                      
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
                      className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                      style={{
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