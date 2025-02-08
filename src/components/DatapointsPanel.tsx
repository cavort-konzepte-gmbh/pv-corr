import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { Plus, X, Edit2 } from 'lucide-react';
import { Language, useTranslation } from '../types/language';
import { fetchParameters, Parameter, createParameter, updateParameter, deleteParameter } from '../services/parameters';
import { Standard, DEFAULT_STANDARDS } from '../types/standards';
import { fetchStandards, createStandard, deleteStandard } from '../services/standards';
import { useKeyAction } from '../hooks/useKeyAction';

interface DatapointsPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  standards: Standard[];
  onStandardsChange: (standards: Standard[]) => void;
}

interface Column {
  id: number | string;
  name: string;
  shortName: string;
  unit: string;
  range: {
    type: 'range' | 'selection' | 'open';
    value: string;
  };
  type: string;
}

const DatapointsPanel: React.FC<DatapointsPanelProps> = ({
  currentTheme,
  currentLanguage,
  standards,
  onStandardsChange
}) => {
  const t = useTranslation(currentLanguage);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localStandards, setLocalStandards] = useState<Standard[]>(standards || DEFAULT_STANDARDS);
  const [newColumn, setNewColumn] = useState<Column>({
    id: 0,
    name: '',
    shortName: '',
    unit: 'Ohm.m',
    range: { type: 'range', value: '' },
    type: 'number'
  });
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [showNewStandard, setShowNewStandard] = useState(false);
  const [newStandard, setNewStandard] = useState<Standard>({
    id: '',
    name: '',
    parameters: []
  });
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedParams, fetchedStandards] = await Promise.all([
          fetchParameters(),
          fetchStandards()
        ]);

        setParameters(fetchedParams);
        if (fetchedStandards?.length > 0) {
          setLocalStandards(fetchedStandards);
          onStandardsChange(fetchedStandards);
        }
      } catch (err) {
        console.error('Error loading data:', err instanceof Error ? err.message : err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [onStandardsChange]);

  const handleAddColumn = async () => {
    if (!newColumn.name.trim()) {
      setError('Parameter name is required');
      return;
    }
    try {
      // For open range type, we don't need to validate the range value
      const rangeValue = newColumn.range.type === 'open' 
        ? newColumn.range.value // Accept any value for open type
        : newColumn.range.value.trim(); // Trim for other types

      const paramData = {
        name: newColumn.name.trim(),
        shortName: newColumn.shortName,
        unit: newColumn.unit === '' ? undefined : newColumn.unit,
        rangeType: newColumn.range.type as Parameter['rangeType'],
        rangeValue
      };

      if (typeof newColumn.id === 'string') {
        await updateParameter(newColumn.id, paramData);
      } else {
        await createParameter(paramData);
      }

      // Refresh parameters list
      const updatedParams = await fetchParameters();
      setParameters(updatedParams);
      setError(null);

      // Reset form and close modal
      setNewColumn({
        id: 0,
        name: '',
        shortName: '',
        unit: 'Ohm.m',
        range: { type: 'range', value: '' },
        type: 'number'
      });
      setShowNewColumn(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Failed to ${typeof newColumn.id === 'string' ? 'update' : 'create'} parameter: ${errorMessage}`);
    }
  };

  const handleAddStandard = async () => {
    if (!newStandard.name.trim()) return;
    if (selectedColumns.length === 0) return;
    
    const standardData = {
      name: newStandard.name.trim(),
      parameters: selectedColumns.map(colId => ({
        parameterId: colId,
        parameterCode: parameters.find(p => p.id === colId)?.shortName || `Z${colId}`,
        ratingRanges: []
      }))
    };

    try {
      await createStandard(standardData);
      const updatedStandards = await fetchStandards();
      setLocalStandards(updatedStandards);
      onStandardsChange(updatedStandards);
      
      // Reset form and close modal
      setNewStandard({ id: '', name: '', parameters: [] });
      setSelectedColumns([]);
      setShowNewStandard(false);
    } catch (err) {
      console.error('Error creating standard:', err);
      setError('Failed to create standard');
    }
  };

  useKeyAction(() => {
    handleAddColumn();
  }, showNewColumn)

  useKeyAction(() => {
    handleAddStandard();
  }, showNewStandard)

  return (
    <div className="p-6">
      {error && (
        <div 
          className="p-4 mb-4 rounded"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            color: currentTheme.colors.accent.primary,
            border: `1px solid ${currentTheme.colors.accent.primary}`
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div 
          className="text-center p-4"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          Loading parameters and standards...
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowNewColumn(true)}
              className="px-4 py-2 rounded text-sm flex items-center gap-2"
              style={{ 
                backgroundColor: currentTheme.colors.accent.primary,
                color: 'white'
              }}
            >
              <Plus size={16} />
              Add Parameter
            </button>
            <button
              onClick={() => setShowNewStandard(true)}
              className="px-4 py-2 rounded text-sm flex items-center gap-2"
              style={{ 
                backgroundColor: currentTheme.colors.accent.primary,
                color: 'white'
              }}
            >
              <Plus size={16} />
              Add Standard
            </button>
          </div>

          {showNewColumn && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div 
                className="p-6 rounded-lg max-w-2xl w-full"
                style={{ backgroundColor: currentTheme.colors.surface }}
              >
                <h3 className="text-lg mb-4" style={{ color: currentTheme.colors.text.primary }}>
                  {typeof newColumn.id === 'string' ? 'Edit Parameter' : 'Add New Parameter'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={newColumn.name}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${currentTheme.colors.border}`,
                        color: currentTheme.colors.text.primary
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                      Short Name
                    </label>
                    <input
                      type="text"
                      value={newColumn.shortName}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, shortName: e.target.value }))}
                      placeholder="Optional short name"
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${currentTheme.colors.border}`,
                        color: currentTheme.colors.text.primary
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                      Unit
                    </label>
                    <select
                      value={newColumn.unit}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${currentTheme.colors.border}`,
                        color: currentTheme.colors.text.primary
                      }}
                    >
                      <option value="">No unit</option>
                      <option value="Ohm.m">Ohm.m</option>
                      <option value="Ohm.cm">Ohm.cm</option>
                      <option value="mmol/kg">mmol/kg</option>
                      <option value="mg/kg">mg/kg</option>
                      <option value="g/mol">g/mol</option>
                      <option value="mg/mmol">mg/mmol</option>
                      <option value="%">%</option>
                      <option value="ppm">ppm</option>
                      <option value="V">V</option>
                      <option value="mV">mV</option>
                      <option value="A">A</option>
                      <option value="mA">mA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                      Range Type
                    </label>
                    <select
                      value={newColumn.range.type}
                      onChange={(e) => setNewColumn(prev => ({
                        ...prev,
                        range: {
                          type: e.target.value as 'range' | 'selection' | 'open',
                          value: ''
                        }
                      }))}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${currentTheme.colors.border}`,
                        color: currentTheme.colors.text.primary
                      }}
                    >
                      <option value="range">Range (e.g., 0-100)</option>
                      <option value="selection">Selection (e.g., [1,2,3])</option>
                      <option value="open">Open (no restriction)</option>
                      <option value="greater">Greater than (&gt;0)</option>
                      <option value="less">Less than (&lt;100)</option>
                      <option value="greaterEqual">Greater than or equal (≥0)</option>
                      <option value="lessEqual">Less than or equal (≤100)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                      Range Value
                    </label>
                    <input
                      type="text"
                      value={newColumn.range.value}
                      onChange={(e) => setNewColumn(prev => ({
                        ...prev,
                        range: {
                          ...prev.range,
                          value: e.target.value
                        }
                      }))}
                      placeholder={
                        newColumn.range.type === 'range' ? '0-100' : 
                        newColumn.range.type === 'selection' ? '1,2,3' : 
                        newColumn.range.type === 'open' ? 'Any value allowed' : 'greater than 0'
                      }
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${currentTheme.colors.border}`,
                        color: currentTheme.colors.text.primary
                      }}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => {
                        setShowNewColumn(false);
                        setNewColumn({
                          id: 0,
                          name: '',
                          shortName: '',
                          unit: 'Ohm.m',
                          range: { type: 'range', value: '' },
                          type: 'number'
                        });
                      }}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        color: currentTheme.colors.text.secondary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddColumn}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.accent.primary,
                        color: 'white'
                      }}
                    >
                      {typeof newColumn.id === 'string' ? 'Save Changes' : 'Add Parameter'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showNewStandard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div 
                className="p-6 rounded-lg max-w-2xl w-full"
                style={{ backgroundColor: currentTheme.colors.surface }}
              >
                <h3 className="text-lg mb-4" style={{ color: currentTheme.colors.text.primary }}>
                  Add New Standard
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                      Standard Name
                    </label>
                    <input
                      type="text"
                      value={newStandard.name}
                      onChange={(e) => setNewStandard(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${currentTheme.colors.border}`,
                        color: currentTheme.colors.text.primary
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: currentTheme.colors.text.secondary }}>
                      Select Parameters
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {parameters.map((param) => (
                        <label
                          key={param.id}
                          className="flex items-center gap-2 p-2 rounded"
                          style={{
                            backgroundColor: currentTheme.colors.border,
                            color: currentTheme.colors.text.primary
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedColumns.includes(param.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedColumns(prev => [...prev, param.id]);
                              } else {
                                setSelectedColumns(prev => prev.filter(id => id !== param.id));
                              }
                            }}
                          />
                          {param.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => {
                        setShowNewStandard(false);
                        setNewStandard({ id: '', name: '', parameters: [] });
                        setSelectedColumns([]);
                      }}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        color: currentTheme.colors.text.secondary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddStandard}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.accent.primary,
                        color: 'white'
                      }}
                    >
                      Add Standard
                    </button>
                  </div>
                  {selectedColumns.length === 0 && (
                    <div 
                      className="text-sm mt-2" 
                      style={{ color: currentTheme.colors.accent.primary }}
                    >
                      Please select at least one parameter
                    </div>
                  )}
                  {!newStandard.name.trim() && (
                    <div 
                      className="text-sm mt-2" 
                      style={{ color: currentTheme.colors.accent.primary }}
                    >
                      Please enter a standard name
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table 
              className="w-full border-collapse" 
              style={{ 
                color: currentTheme.colors.text.primary,
                borderColor: currentTheme.colors.border
              }}
            >
              <thead>
                <tr>
                  <th 
                    className="p-2 text-left border font-normal w-16"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    #
                  </th>
                  <th 
                    className="p-2 text-left border font-normal w-1/3"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    Parameter
                  </th>
                  <th 
                    className="p-2 text-left border font-normal w-24"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    Short Name
                  </th>
                  <th 
                    className="p-2 text-left border font-normal w-24"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    Unit
                  </th>
                  <th 
                    className="p-2 text-left border font-normal w-48"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    Range
                  </th>
                  <th 
                    className="p-2 text-center border font-normal w-24"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    Actions
                  </th>
                  {standards.map(standard => (
                    <th 
                      key={standard.id}
                      className="p-2 text-center border font-normal w-24"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{standard.name}</span>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this standard?')) {
                              deleteStandard(standard.id)
                                .then(async () => {
                                  const updatedStandards = await fetchStandards();
                                  setLocalStandards(updatedStandards);
                                  onStandardsChange(updatedStandards);
                                })
                                .catch(err => {
                                  console.error('Error deleting standard:', err);
                                  setError('Failed to delete standard');
                                });
                            }
                          }}
                          className="p-1 rounded hover:bg-opacity-80"
                          style={{ color: currentTheme.colors.text.secondary }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parameters.map((param, index) => (
                  <tr
                    key={param.id}
                    className="text-[10px]"
                    style={{ backgroundColor: currentTheme.colors.surface }}
                  >
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      {index + 1}
                    </td>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <div>
                        <div className="font-medium">{param.customName || param.name}</div>
                        {param.description && (
                          <div className="text-xs mt-1" style={{ color: currentTheme.colors.text.secondary }}>
                            {param.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <span className="font-mono">{param.shortName || '-'}</span>
                    </td>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <span className="font-mono">{param.unit || '-'}</span>
                    </td>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <span className="font-mono">
                        {param.rangeType === 'range' ? param.rangeValue : 
                         param.rangeType === 'selection' ? `[${param.rangeValue}]` : 
                         param.rangeValue}
                      </span>
                    </td>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setNewColumn({
                              id: param.id,
                              name: param.name,
                              shortName: param.shortName || '',
                              unit: param.unit || '',
                              range: {
                                type: param.rangeType as 'range' | 'selection' | 'open',
                                value: param.rangeValue
                              },
                              type: param.rangeType === 'selection' ? 'select' : 'number'
                            });
                            setShowNewColumn(true);
                          }}
                          className="p-1 rounded hover:bg-opacity-80"
                          style={{ color: currentTheme.colors.text.secondary }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this parameter?')) {
                              deleteParameter(param.id)
                                .then(() => fetchParameters())
                                .then(updatedParams => setParameters(updatedParams))
                                .catch(err => {
                                  console.error('Error deleting parameter:', err);
                                  setError('Failed to delete parameter');
                                });
                            }
                          }}
                          className="p-1 rounded hover:bg-opacity-80"
                          style={{ color: currentTheme.colors.text.secondary }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                    {standards.map(standard => (
                      <td 
                        key={standard.id}
                        className="p-2 border text-center"
                        style={{ 
                          borderColor: currentTheme.colors.border,
                          backgroundColor: standard.parameters?.some(p => p.parameterId === param.id)
                            ? `${currentTheme.colors.accent.primary}20` 
                            : 'transparent'
                        }}
                      >
                        {standard.parameters?.some(p => p.parameterId === param.id) && (
                          <span style={{ color: currentTheme.colors.accent.primary }}>×</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DatapointsPanel;