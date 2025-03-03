import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Language, useTranslation } from '../../../../types/language';
import { Parameter } from '../../../../types/parameters';
import { Datapoint } from '../../../../types/projects';
import { Edit2, Save, X, Upload, Clock, Plus } from 'lucide-react';
import MediaDialog from '../../../shared/MediaDialog';
import { fetchProjects } from '../../../../services/projects';
import { updateDatapoint } from '../../../../services/datapoints';
import { FormHandler } from '../../../shared/FormHandler';
import { createDatapoint } from '../../../../services/datapoints';

interface DatapointListProps {
  currentTheme: Theme;
  currentLanguage: Language;
  datapoints: Datapoint[];
  parameters: Parameter[];
  onProjectsChange: (projects: any[]) => void;
}

const DatapointList: React.FC<DatapointListProps> = ({
  currentTheme,
  currentLanguage,
  datapoints,
  parameters,
  onProjectsChange
}) => {
  const [editingDatapoint, setEditingDatapoint] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [showMediaDialog, setShowMediaDialog] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage);
  const [isAdding, setIsAdding] = useState(false);
  const [newValues, setNewValues] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);



  const handleAddDatapoint = async () => {
    if (!newName.trim()) {
      setError('Datapoint name is required');
      return;
    }
    if (Object.keys(newValues).length === 0) {
      setError('Please enter at least one value');
      return;
    }

    try {
      await createDatapoint(zoneId, {
        type: 'measurement',
        name: newName.trim(),
        values: newValues,
        ratings: {}
      });

      setIsAdding(false);
      setNewName('');
      setNewValues({});
      setError(null);
      const projects = await fetchProjects();
      onProjectsChange(projects);
    } catch (err) {
      console.error('Error creating datapoint:', err);
      setError('Failed to create datapoint');
    }
  };

  const handleUpdateDatapoint = async (datapoint: Datapoint) => {
    if (editingDatapoint === datapoint.id) {
      // Save changes
      setEditingDatapoint(null);
      setEditingName('');
      setEditingValues({});
      await updateDatapoint(editingDatapoint, {
        values: editingValues
      })
      const projects = await fetchProjects();
      onProjectsChange(projects);
    } else {
      // Start editing
      setEditingDatapoint(datapoint.id);
      setEditingName(datapoint.name || datapoint.sequentialId);
      setEditingValues(datapoint.values);
    }
  }

  return (
    <div>
      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-3 px-4 mb-4 flex items-center justify-center gap-x-2 text-sm text-white rounded bg-accent-primary"
      >
        <Plus size={16} />
        {translation("datapoint.add_new")}
      </button>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 text-secondary">{translation("datapoint.short_name")}</th>
            {parameters.map(param => (
              <th key={param.id} className="text-center p-2 text-secondary w-32">
                {param.shortName || param.name}
              </th>
            ))}
            <th className="text-center p-2 text-secondary">{translation("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {isAdding && (
            <tr>
              <td className="p-2 border-t border-theme">
                <FormHandler
                  isEditing={true}
                  onSave={handleAddDatapoint}
                  onCancel={() => {
                    setIsAdding(false);
                    setNewName('');
                    setNewValues({});
                  }}
                >
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder="Enter name"
                  />
                </FormHandler>
              </td>
              {parameters.map(param => (
                <td key={param.id} className="p-2 border-t border-theme text-center">
                  <input
                    type="text"
                    value={newValues[param.id] || ''}
                    onChange={(e) => setNewValues(prev => ({
                      ...prev,
                      [param.id]: e.target.value
                    }))}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface text-center"
                    placeholder={`Enter ${param.name}`}
                  />
                </td>
              ))}
              <td className="p-2 border-t border-theme">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleAddDatapoint}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewName('');
                      setNewValues({});
                    }}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    <X size={14} />
                  </button>
                </div>
              </td>
            </tr>
          )}
          {datapoints.map(datapoint => (
            <tr key={datapoint.id} className="border-t border-theme">
              <td className="p-2">
                {editingDatapoint === datapoint.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                  />
                ) : (
                  <span className="text-primary">
                    {datapoint.name || datapoint.sequentialId}
                  </span>
                )}
              </td>
              {parameters.map(param => (
                <td key={param.id} className="p-2 text-center w-32">
                  {editingDatapoint === datapoint.id ? (
                    <input
                      type="text"
                      value={editingValues[param.id] || datapoint.values[param.id] || ''}
                      onChange={(e) => setEditingValues(prev => ({
                        ...prev,
                        [param.id]: e.target.value
                      }))}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface text-center"
                    />
                  ) : (
                    <span className="text-primary">
                      {datapoint.values[param.id] || '-'}
                    </span>
                  )}
                </td>
              ))}
              <td className="p-2">
                <div className="flex items-center justify-center gap-2">
                  <div 
                    className="relative group cursor-help"
                    title={new Date(datapoint.timestamp).toLocaleString()}
                  >
                    <Clock size={14} className="text-secondary" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-surface border border-theme invisible group-hover:visible whitespace-nowrap">
                      {new Date(datapoint.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateDatapoint(datapoint)}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    {editingDatapoint === datapoint.id ? (
                      <Save size={14} />
                    ) : (
                      <Edit2 size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => setShowMediaDialog(datapoint.id)}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    <Upload size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {error && (
        <div className="mt-2 p-2 rounded text-sm text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      {showMediaDialog && (
        <MediaDialog
          isOpen={true}
          onClose={() => setShowMediaDialog(null)}
          entityId={showMediaDialog}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
};

export default DatapointList;