import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Person } from '../../../../types/people';
import { Company } from '../../../../types/companies';
import { Plus } from 'lucide-react';
import { createProject } from '../../../../services/projects';
import { generateHiddenId } from '../../../../utils/generateHiddenId';

interface ProjectFormProps {
  currentTheme: Theme;
  savedPeople: Person[];
  savedCompanies: Company[];
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  currentTheme,
  savedPeople,
  savedCompanies
}) => {
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [clientRef, setClientRef] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [typeProject, setTypeProject] = useState<'roof' | 'field'>('field');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      await createProject({
        name: projectName,
        hiddenId: generateHiddenId(),
        clientRef: clientRef || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        imageUrl: imageUrl || undefined,
        managerId: selectedManagerId || undefined,
        typeProject
      });

      setShowForm(false);
      setProjectName('');
      setClientRef('');
      setLatitude('');
      setLongitude('');
      setImageUrl('');
      setSelectedManagerId(null);
      setTypeProject('field');
      setError(null);
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6 text-white bg-accent-primary"
      >
        <Plus size={16} />
        Add New Project
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-6 text-primary">New Project</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Project Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Project Manager
                </label>
                <select
                  value={selectedManagerId || ''}
                  onChange={(e) => setSelectedManagerId(e.target.value || null)}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="">No manager assigned</option>
                  {savedPeople.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.title ? `${person.title} ` : ''}
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
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
                  Client Reference
                </label>
                <input
                  type="text"
                  value={clientRef}
                  onChange={(e) => setClientRef(e.target.value)}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  placeholder="Enter client reference"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Latitude
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  placeholder="Enter latitude"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Longitude
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  placeholder="Enter longitude"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Project Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  placeholder="Enter image URL (e.g. https://images.unsplash.com/...)"
                />
              </div>

              {error && (
                <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectForm;