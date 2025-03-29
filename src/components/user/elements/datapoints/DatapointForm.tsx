import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Language, useTranslation } from '../../../../types/language';
import { Parameter } from '../../../../types/parameters';
import { Plus, Save, X } from 'lucide-react';
import { createDatapoint } from '../../../../services/datapoints';
import { fetchProjects } from '../../../../services/projects';
import { FormHandler } from '../../../shared/FormHandler';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DatapointFormProps {
  currentTheme: Theme;
  currentLanguage: Language;
  parameters: Parameter[];
  zoneId: string;
  onProjectsChange: (projects: any[]) => void;
}

const DatapointForm: React.FC<DatapointFormProps> = ({ currentTheme, currentLanguage, parameters, zoneId, onProjectsChange }) => {
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
        ratings: {},
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
        {t('datapoint.add_new')}
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
            <section className="border border-input rounded-md bg-card">
              <div className="w-full relative overflow-auto">
                <Table>
                  <TableCaption></TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead> {t('datapoint.short_name')}</TableHead>
                      {parameters.map((param) => (
                        <th key={param.id} className="p-2 text-left border font-normal border-theme">
                          {param.shortName || param.name}
                          {param.unit && <span className="ml-1 text-xs">({param.unit})</span>}
                        </th>
                      ))}
                      <TableHead className="w-24 text-center">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="p-2 border border-theme">
                        <Input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          placeholder="Enter name"
                        />
                      </TableCell>
                      {parameters.map((param) => (
                        <TableCell key={param.id} className="p-2 border border-theme">
                          <Input
                            type="text"
                            value={values[param.id] || ''}
                            onChange={(e) =>
                              setValues((prev) => ({
                                ...prev,
                                [param.id]: e.target.value,
                              }))
                            }
                            className="w-full p-1 rounded text-sm  border-theme border-solid bg-surface text-center"
                            placeholder={`Enter ${param.name}`}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="p-2 border border-theme">
                        <div className="flex items-center justify-center gap-2">
                          <Button onClick={handleSubmit} className="p-1 rounded hover:bg-opacity-80 text-secondary">
                            <Save size={14} />
                          </Button>
                          <Button
                            onClick={() => {
                              setIsAdding(false);
                              setName('');
                              setValues({});
                            }}
                            className="p-1 rounded hover:bg-opacity-80 text-secondary"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>
          </FormHandler>

          {error && (
            <div className="mt-2 p-2 rounded text-sm text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>
          )}
        </div>
      )}
    </>
  );
};

export default DatapointForm;
