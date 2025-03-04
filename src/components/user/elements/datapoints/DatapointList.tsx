import React, { useState, useEffect } from 'react';
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
import { deleteDatapoint } from '../../../../services/datapoints';
import { ParameterInput } from '../../../DatapointForm';

interface DatapointListProps {
  currentTheme: Theme;
  currentLanguage: Language;
  datapoints: Datapoint[];
  parameters: Parameter[];
  zoneId: string
  onProjectsChange: (projects: any[]) => void;
}

const DatapointList: React.FC<DatapointListProps> = ({
  currentTheme,
  currentLanguage,
  datapoints,
  parameters,
  zoneId,
  onProjectsChange
}) => {
  const [editingDatapoint, setEditingDatapoint] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [parameterMap, setParameterMap] = useState<Record<string, Parameter>>({});
  const [showMediaDialog, setShowMediaDialog] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage);
  const [isAdding, setIsAdding] = useState(false);
  const [newValues, setNewValues] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create a map of parameter id to parameter object for easier lookup
    const map = parameters.reduce((acc, param) => {
      acc[param.id] = param;
      return acc;
    }, {} as Record<string, Parameter>);
    setParameterMap(map);
  }, [parameters]);


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
      if (!editingName?.trim()) {
        setError('Name is required');
        return;
      }

      const updateData = {
        values: editingValues,
        name: editingName.trim()
      };
      
      setEditingDatapoint(null);
      setEditingName('');
      setEditingValues({});
      try {
        await updateDatapoint(editingDatapoint, updateData);
        const projects = await fetchProjects();
        onProjectsChange(projects);
      } catch (err) {
        console.error('Error updating datapoint:', err);
        setError('Failed to update datapoint');
      }
    } else {
      // Start editing
      setEditingDatapoint(datapoint.id);
      setEditingName(datapoint.name);
      setEditingValues(datapoint.values);
    }
  };

  const handleDeleteDatapoint = async (datapointId: string) => {
    try {
      await deleteDatapoint(datapointId);
      const projects = await fetchProjects();
      onProjectsChange(projects);
    } catch (err) {
      console.error('Error deleting datapoint:', err);
      setError('Failed to delete datapoint');
    }
  };

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
              <td className="p-2 border border-theme">
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
                    placeholder="Enter custom name (optional)"
                  />
                </FormHandler>
              </td>
              {parameters.map(param => (
                <td key={param.id} className="p-2 border border-theme text-center">
                  <ParameterInput
                    parameter={{
                      ...param,
                      parameterCode: param.shortName || param.name
                    }}
                    value={newValues[param.id] || ''}
                    onChange={(value) => setNewValues(prev => ({
                      ...prev,
                      [param.id]: value
                    }))}
                    currentTheme={currentTheme}
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
                    value={editingName || ''}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder="Enter name"
                  />
                ) : (
                  <span className="text-primary">
                    {datapoint.name}
                  </span>
                )}
              </td>
              {parameters.map(param => (
                <td key={param.id} className="p-2 text-center w-32">
                  {editingDatapoint === datapoint.id ? (
                    <ParameterInput
                      parameter={{
                        ...param,
                        parameterCode: param.shortName || param.name,
                        rangeType: param.rangeType,
                        rangeValue: param.rangeValue
                      }}
                      value={editingValues[param.id] || datapoint.values[param.id] || ''}
                      onChange={(value) => setEditingValues(prev => ({
                        ...prev,
                        [param.id]: value
                      }))}
                      currentTheme={currentTheme}
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
                  {editingDatapoint === datapoint.id && (
                    <button
                      onClick={() => handleDeleteDatapoint(datapoint.id)}
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <X size={14} />
                    </button>
                  )}
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
          entityType='datapoint'
        />
      )}
    </div>
  );
};

export default DatapointList;