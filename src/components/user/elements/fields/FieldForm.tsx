import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Plus, Folder } from 'lucide-react';
import { createField } from '../../../../services/fields';
import { fetchProjects } from '../../../../services/projects';
import { Language, useTranslation } from '../../../../types/language';
import { Project } from '../../../../types/projects';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const initialState = {
  name: '',
  latitude: '',
  longitude: '',
  has_fence: '',
};

interface FieldFormProps {
  currentTheme: Theme;
  selectedProjectId: string;
  onProjectsChange: (projects: Project[]) => void;
  currentLanguage: Language;
}

const FieldForm: React.FC<FieldFormProps> = ({ currentTheme, selectedProjectId, onProjectsChange, currentLanguage }) => {
  const [showForm, setShowForm] = useState(false);
  const [newField, setNewField] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setNewField((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setNewField(initialState);
    setShowForm(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newField || !selectedProjectId) return;
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
        className="w-full py-3 px-4 mt-8 flex items-center justify-center gap-x-2 text-sm text-white rounded bg-accent-primary"
        onClick={() => setShowForm(true)}
      >
        <Plus className="size-4" />
        {translation('field.add')}
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="flex gap-2 text-lg mb-4 text-primary">
              <Folder className="text-accent-primary" />
              {translation('field.add_new')}
            </h3>
            <form onSubmit={handleSubmit}>
              <Label className="block text-sm mb-1 text-secondary" htmlFor="new-field">
                {translation('field.name')}
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="name"
                  required
                  value={newField.name}
                  onChange={handleChange}
                />
              </Label>
              <Label className="block text-sm mb-1 text-secondary">
                {translation('project.latitude')}
                <Input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="latitude"
                  value={newField.latitude}
                  onChange={handleChange}
                />
              </Label>
              <Label className="block text-sm mb-1 text-secondary">
                {translation('project.longitude')}
                <Input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="longitude"
                  value={newField.longitude}
                  onChange={handleChange}
                />
              </Label>
              <div className="block text-sm mb-1 text-secondary">
                <Label>{translation('field.has_fence')}</Label>
                <select
                  name="has_fence"
                  value={newField.has_fence}
                  onChange={handleChange}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="">Select fence option</option>
                  <option value="no">{translation('field.has_fence.no')}</option>
                  <option value="yes">{translation('field.has_fence.yes')}</option>
                </select>
              </div>
              <div className="w-full mt-6 flex items-center justify-end gap-x-2">
                <Button
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                  type="button"
                  onClick={handleReset}
                >
                  {translation('actions.cancel')}
                </Button>
                <Button className="px-4 py-2 rounded text-sm text-white bg-accent-primary" type="submit">
                  {translation('actions.save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FieldForm;
