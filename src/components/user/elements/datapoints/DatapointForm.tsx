import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Language, useTranslation } from '../../../../types/language';
import { Parameter } from '../../../../types/parameters';
import { Plus, Save, X } from 'lucide-react';
import { createDatapoint } from '../../../../services/datapoints';
import { fetchProjects } from '../../../../services/projects';
import { FormHandler } from '../../../shared/FormHandler';

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
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation(currentLanguage);

  const handleSubmit = async () => {
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

      setIsAdding(false);
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
        onClick={() => setIsAdding(true)}
        className="w-full py-3 px-4 mt-8 flex items-center justify-center gap-x-2 text-sm text-white rounded bg-accent-primary"
      >
        <Plus size={16} />
        {t("datapoint.add_new")}
      </button>

      {isAdding && (
        <div className="mt-4">
          <FormHandler
            isEditing={true}
            onSave={handleSubmit}
            onCancel={() => {
              setIsAdding(false);
              setName('');
              setValues({});
            }}
          >
            <table className="w-full border-collapse border-theme text-primary">
              <thead>
                <tr>
                  <th className="p-2 text-left border font-normal border-theme">
                    {t("datapoint.short_name")}
                  </th>
                  {parameters.map(param => (
                    <th key={param.id} className="p-2 text-left border font-normal border-theme">
                      {param.shortName || param.name}
                      {param.unit && <span className="ml-1 text-xs">({param.unit})</span>}
                    </th>
                  ))}
                  <th className="p-2 text-center border font-normal border-theme w-24">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-theme">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                      placeholder="Enter name"
                    />
                  </td>
                  {parameters.map(param => (
                    <td key={param.id} className="p-2 border border-theme">
                      <input
                        type="text"
                        value={values[param.id] || ''}
                        onChange={(e) => setValues(prev => ({
                          ...prev,
                          [param.id]: e.target.value
                        }))}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface text-center"
                        placeholder={`Enter ${param.name}`}
                      />
                    </td>
                  ))}
                  <td className="p-2 border border-theme">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={handleSubmit}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setName('');
                          setValues({});
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </FormHandler>

          {error && (
            <div className="mt-2 p-2 rounded text-sm text-accent-primary border-accent-primary border-solid bg-surface">
              {error}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DatapointForm;