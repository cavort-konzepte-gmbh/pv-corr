import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Edit2, X, Save } from 'lucide-react';
import { generateHiddenId } from '../../utils/generateHiddenId';

interface NeighboringStructuresManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

interface NeighboringStructure {
  id: string;
  hidden_id: string;
  name: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
}

const NeighboringStructuresManagement: React.FC<NeighboringStructuresManagementProps> = ({ currentTheme, onBack }) => {
  const [structures, setStructures] = useState<NeighboringStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStructure, setEditingStructure] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<NeighboringStructure>>({});
  const [isNewStructure, setIsNewStructure] = useState(false);
  const [newStructure, setNewStructure] = useState<Partial<NeighboringStructure>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('neighboring_structures')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setStructures(data || []);
    } catch (err) {
      console.error('Error loading neighboring structures:', err);
      setError('Failed to load neighboring structures');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEditingValues = (field: keyof NeighboringStructure, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeNewStructure = (field: keyof NeighboringStructure, value: string) => {
    setNewStructure(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetValues = () => {
    setEditingValues({});
    setEditingStructure(null);
  };

  const handleUpdateSaveStructure = async (structure: NeighboringStructure) => {
    if (editingStructure === structure.id) {
      try {
        if (!editingValues.name?.trim()) {
          setError('Name is required');
          return;
        }

        const { error } = await supabase
          .from('neighboring_structures')
          .update({ 
            name: editingValues.name.trim(),
            description: editingValues.description?.trim() || null,
            risk_level: editingValues.risk_level || 'low'
          })
          .eq('id', structure.id);

        if (error) throw error;
        await loadData();
        resetValues();
      } catch (err) {
        console.error('Error updating structure:', err);
        setError('Failed to update structure');
      }
    } else {
      setEditingStructure(structure.id);
      setEditingValues(structure);
      setNewStructure({});
      setIsNewStructure(false);
    }
  };

  const handleDeleteStructure = async (structureId: string) => {
    try {
      const { error } = await supabase
        .from('neighboring_structures')
        .delete()
        .eq('id', structureId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error deleting structure:', err);
      setError('Failed to delete structure');
    }
  };

  const handleOpenNewStructure = () => {
    resetValues();
    setIsNewStructure(true);
  };

  const handleAddNewStructure = async () => {
    try {
      if (!newStructure.name?.trim()) {
        setError('Name is required');
        return;
      }

      const { error } = await supabase
        .from('neighboring_structures')
        .insert({
          name: newStructure.name.trim(),
          description: newStructure.description?.trim() || null,
          risk_level: newStructure.risk_level || 'low',
          hidden_id: generateHiddenId()
        });

      if (error) throw error;
      await loadData();
      resetValues();
      setNewStructure({});
      setIsNewStructure(false);
    } catch (err) {
      console.error('Error creating structure:', err);
      setError('Failed to create structure');
    }
  };

  const handleCancelNewStructure = () => {
    resetValues();
    setNewStructure({});
    setIsNewStructure(false);
  };

  return (
    <div className="p-8">
      {error && (
        <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded hover:bg-opacity-80 text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-primary">
          Neighboring Structures Management
        </h2>
      </div>

      {loading ? (
        <div className="text-center p-4 text-secondary">
          Loading neighboring structures...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg text-primary">
              Neighboring Structures
            </h3>
            <button
              onClick={handleOpenNewStructure}
              className="px-3 py-1 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
            >
              <Plus size={14} />
              Add Structure
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-theme text-primary">
              <thead>
                <tr>
                  <th className="p-2 text-left border font-normal border-theme">
                    Name
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Description
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Risk Level
                  </th>
                  <th className="p-2 text-center border font-normal border-theme">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {structures.map((structure) => (
                  <tr key={structure.id}>
                    <td className="p-2 border border-theme">
                      {editingStructure === structure.id ? (
                        <input
                          type="text"
                          value={editingValues.name || ''}
                          onChange={(e) => handleChangeEditingValues('name', e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : (
                        structure.name
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingStructure === structure.id ? (
                        <input
                          type="text"
                          value={editingValues.description || ''}
                          onChange={(e) => handleChangeEditingValues('description', e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : (
                        structure.description
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingStructure === structure.id ? (
                        <select
                          value={editingValues.risk_level || 'low'}
                          onChange={(e) => handleChangeEditingValues('risk_level', e.target.value as 'low' | 'medium' | 'high')}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <span className={
                          structure.risk_level === 'high' ? 'text-red-500' :
                          structure.risk_level === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }>
                          {structure.risk_level.charAt(0).toUpperCase() + structure.risk_level.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateSaveStructure(structure)}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          {editingStructure === structure.id ? (
                            <Save size={14} />
                          ) : (
                            <Edit2 size={14} />
                          )}
                        </button>
                        <button onClick={() => handleDeleteStructure(structure.id)}>
                          <X className="text-secondary" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {isNewStructure && (
                  <tr>
                    <td className="p-2 border border-theme">
                      <input
                        type="text"
                        value={newStructure.name || ''}
                        onChange={(e) => handleChangeNewStructure('name', e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        placeholder="Enter structure name"
                      />
                    </td>
                    <td className="p-2 border border-theme">
                      <input
                        type="text"
                        value={newStructure.description || ''}
                        onChange={(e) => handleChangeNewStructure('description', e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        placeholder="Enter description"
                      />
                    </td>
                    <td className="p-2 border border-theme">
                      <select
                        value={newStructure.risk_level || 'low'}
                        onChange={(e) => handleChangeNewStructure('risk_level', e.target.value as 'low' | 'medium' | 'high')}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td className="p-2 border border-theme">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={handleAddNewStructure}>
                          <Save size={14} />
                        </button>
                        <button onClick={handleCancelNewStructure}>
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeighboringStructuresManagement;