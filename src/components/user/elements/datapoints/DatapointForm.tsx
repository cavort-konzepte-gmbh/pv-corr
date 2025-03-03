import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Language, useTranslation } from '../../../../types/language';
import { Parameter } from '../../../../types/parameters';
import { Plus } from 'lucide-react';
import { createDatapoint } from '../../../../services/datapoints';
import { fetchProjects } from '../../../../services/projects';

interface DatapointFormProps {
  currentTheme: Theme;
  currentLanguage: Language;
  parameters: Parameter[];
  zoneId: string;
  onProjectsChange: (projects: any[]) => void;
}

const DatapointForm: React.FC<DatapointFormProps> = ({
  currentTheme,
  currentLanguage,
  parameters,
  zoneId,
  onProjectsChange
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation(currentLanguage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Datapoint name is required');
      return;
    }
    if (Object.keys(values).length === 0) {
      setError('Please enter at least one value');
      return;
    }

    try {
      await createDatapoint(zoneId, {
        type: 'measurement',
        name: name.trim(),
        values,
        ratings: {}
      });

      setShowForm(false);
      setName('');
      setValues({});
      setError(null);
      const projects = await fetchProjects();
      onProjectsChange(projects);
    } catch (err) {
      console.error('Error creating datapoint:', err);
      setError('Failed to create datapoint');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6 text-white bg-accent-primary"
      >
        <Plus size={16} />
        {t("datapoint.add_new")}
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-4xl w-full bg-surface">
            <h3 className="text-lg mb-4 text-primary">
              {t("datapoint.add_new")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  {t("datapoint.short_name")}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  placeholder="Enter datapoint name"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {parameters.map(param => (
                  <div key={param.id}>
                    <label className="block text-sm mb-1 text-secondary">
                      {param.shortName || param.name}
                      {param.unit && <span className="ml-1 text-xs">({param.unit})</span>}
                    </label>
                    <input
                      type="text"
                      value={values[param.id] || ''}
                      onChange={(e) => setValues(prev => ({
                        ...prev,
                        [param.id]: e.target.value
                      }))}
                      className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                      placeholder={`Enter ${param.name}`}
                    />
                  </div>
                ))}
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
                    setValues({});
                  }}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                >
                  {t("actions.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                >
                  {t("actions.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DatapointForm;