import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Person } from '../../../../types/people';
import { Company } from '../../../../types/companies';
import { Plus } from 'lucide-react';
import { createProject } from '../../../../services/projects';
import { generateHiddenId } from '../../../../utils/generateHiddenId';
import { Language, useTranslation } from '../../../../types/language';

interface ProjectFormProps {
  currentTheme: Theme;
  savedPeople: Person[];
  savedCompanies: Company[];
  currentLanguage: Language
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  currentTheme,
  savedPeople,
  savedCompanies,
  currentLanguage
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
  const translation = useTranslation(currentLanguage)

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
        className="w-full py-3 px-4 mt-8 flex items-center justify-center gap-x-2 text-sm text-white rounded bg-accent-primary"
        onClick={() => setShowForm(true)}
      >
        <Plus size={16} />
        {translation("project.add")}
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-6 text-primary">{translation("project.new")}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  {translation("project.name")}
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
                  {translation("project.manager")}
                </label>
                <select
                  value={selectedManagerId || ''}
                  onChange={(e) => setSelectedManagerId(e.target.value || null)}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="">{translation("project.manager.not_assigned")}</option>
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
                  {translation("project.type")}
                </label>
                <select
                  value={typeProject}
                  onChange={(e) => setTypeProject(e.target.value as 'roof' | 'field')}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="field">{translation("project.type.field")}</option>
                  <option value="roof">{translation("project.type.roof")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  {translation("project.client_ref")}
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
                  {translation("project.latitude")}
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
                  {translation("project.longitude")}
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
                  {translation("project.image_url")}
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
                  {translation("actions.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                >
                  {translation("project.create")}
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