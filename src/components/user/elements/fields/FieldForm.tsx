import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Plus, Folder } from 'lucide-react';
import { createField } from '../../../../services/fields';
import { fetchProjects } from '../../../../services/projects';

interface FieldFormProps {
  currentTheme: Theme;
  selectedProjectId: string;
  onProjectsChange: (projects: Project[]) => void;
}

const FieldForm: React.FC<FieldFormProps> = ({
  currentTheme,
  selectedProjectId,
  onProjectsChange
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    latitude: '',
    longitude: '',
    has_fence: false
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setNewField(previous => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReset = () => {
    setNewField({
      name: '',
      latitude: '',
      longitude: '',
      has_fence: false
    });
    setShowForm(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!newField || !selectedProjectId) return;
    try {
      await createField(selectedProjectId, newField);
      // Fetch fresh projects data to ensure everything is in sync
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }
    } catch (err) {
      console.error('Error creating field:', err);
      setError('Failed to create field');
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
        Add Field
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="flex gap-2 text-lg mb-4 text-primary">
              <Folder className="text-accent-primary" />
              Add New Field
            </h3>
            <form onSubmit={handleSubmit}>
              <label className="block text-sm mb-1 text-secondary" htmlFor="new-field">
                Field Name
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="name"
                  required
                  value={newField.name}
                  onChange={handleChange}
                />
              </label>
              <label className="block text-sm mb-1 text-secondary">
                Latitude
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="latitude"
                  value={newField.latitude}
                  onChange={handleChange}
                />
              </label>
              <label className="block text-sm mb-1 text-secondary">
                Longitude
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="longitude"
                  value={newField.longitude}
                  onChange={handleChange}
                />
              </label>
              <div className="block text-sm mb-1 text-secondary">
                <label>Has Fence</label>
                <select
                  name="has_fence"
                  value={newField.has_fence ? 'yes' : 'no'}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'has_fence',
                      value: e.target.value === 'yes',
                      type: 'checkbox',
                      checked: e.target.value === 'yes'
                    }
                  } as React.ChangeEvent<HTMLInputElement>)}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="w-full mt-6 flex items-center justify-end gap-x-2">
                <button
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                  type="button"
                  onClick={handleReset}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FieldForm;