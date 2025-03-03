import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Plus } from 'lucide-react';
import { createZone } from '../../../../services/zones';
import { fetchProjects } from '../../../../services/projects';
import { Language, useTranslation } from '../../../../types/language';

interface ZoneFormProps {
  currentTheme: Theme;
  selectedFieldId: string;
  onProjectsChange: (projects: Project[]) => void;
  currentLanguage: Language
}

const ZoneForm: React.FC<ZoneFormProps> = ({
  currentTheme,
  selectedFieldId,
  onProjectsChange,
  currentLanguage
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    latitude: '',
    longitude: ''
  });
  const [error, setError] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewZone(previous => ({
      ...previous,
      [name]: value
    }));
  };

  const handleReset = () => {
    setNewZone({
      name: '',
      latitude: '',
      longitude: ''
    });
    setShowForm(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!newZone || !selectedFieldId) return;
    try {
      await createZone(selectedFieldId, newZone);
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }
    } catch (err) {
      console.error('Error creating zone:', err);
      setError('Failed to create zone');
    }
    handleReset();
  };

  return (
    <>
      <button 
        className="w-full py-3 px-4 mb-8 flex items-center justify-center gap-x-2 text-sm text-primary rounded border-accent-primary border-solid bg-accent-primary"
        onClick={() => setShowForm(true)}
      >
        <Plus className="size-4 text-primary" />
        {translation("zones.add")}
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-4 text-primary">
              {translation("zones.add_new")}
            </h3>
            <form onSubmit={handleSubmit}>
              <label className="block text-sm mb-1 text-secondary">
                {translation("zones.name")}
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="name"
                  required
                  value={newZone.name}
                  onChange={handleChange}
                />
              </label>
              <label className="block text-sm mb-1 text-secondary">
                {translation("project.latitude")}
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="latitude"
                  value={newZone.latitude}
                  onChange={handleChange}
                />
              </label>
              <label className="block text-sm mb-1 text-secondary">
                {translation("project.longitude")}
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="longitude"
                  value={newZone.longitude}
                  onChange={handleChange}
                />
              </label>
              <div className="w-full mt-6 flex items-center justify-end gap-x-2">
                <button
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                  type="button"
                  onClick={handleReset}
                >
                  {translation("actions.cancel")}
                </button>
                <button
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                  type="submit"
                >
                  {translation("actions.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ZoneForm;