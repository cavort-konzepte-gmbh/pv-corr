import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Edit2, X, Save } from 'lucide-react';
import { FormHandler, FormInput, FormSelect, DeleteConfirmDialog } from '../shared/FormHandler';
import { useKeyAction } from '../../hooks/useKeyAction';
import { generateHiddenId } from '../../utils/generateHiddenId';

interface NeighboringStructure {
  id: string;
  hidden_id: string;
  name: string;
  depth?: number;
  height?: number;
  coating_material_id?: string;
  coating_thickness?: number;
  coating_thickness_unit?: 'mm' | 'μm';
  construction_year?: number;
}

interface NeighboringStructuresManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

const NeighboringStructuresManagement: React.FC<NeighboringStructuresManagementProps> = ({ currentTheme, onBack }) => {
  const [structures, setStructures] = useState<NeighboringStructure[]>([]);
  const [materials, setMaterials] = useState<{ id: string; name: string; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStructure, setEditingStructure] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<NeighboringStructure>>({});
  const [isNewStructure, setIsNewStructure] = useState(false);
  const [newStructure, setNewStructure] = useState<Partial<NeighboringStructure>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      console.error('Error loading materials:', err);
      setError('Failed to load materials');
    }
  };

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
        // Validate required fields
        if (!editingValues.name?.trim()) {
          setError('Name is required');
          return;
        }

        // Prepare update data with proper type conversions
        const updateData = {
          name: editingValues.name.trim(),
          depth: editingValues.depth ? parseFloat(editingValues.depth.toString()) : null,
          height: editingValues.height ? parseFloat(editingValues.height.toString()) : null,
          coating_material_id: editingValues.coating_material_id || null,
          coating_thickness: editingValues.coating_thickness ? parseFloat(editingValues.coating_thickness.toString()) : null,
          coating_thickness_unit: editingValues.coating_thickness_unit || null,
          construction_year: editingValues.construction_year ? parseInt(editingValues.construction_year.toString()) : null
        };

        const { error } = await supabase
          .from('neighboring_structures')
          .update(updateData)
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
      // Get structure name for confirmation
      const structure = structures.find(s => s.id === structureId);
      if (!structure) return;

      // Only proceed if name matches
      if (deleteConfirmName !== structure.name) {
        setError('Structure name does not match');
        return;
      }

      const { error } = await supabase
        .from('neighboring_structures')
        .delete()
        .eq('id', structureId);

      if (error) throw error;
      setDeleteConfirm(null);
      setDeleteConfirmName('');
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
      // Validate required fields
      if (!newStructure.name?.trim()) {
        setError('Name is required');
        return;
      }

      // Prepare structure data with proper type conversions
      const structureData = {
        name: newStructure.name.trim(),
        depth: newStructure.depth ? parseFloat(newStructure.depth.toString()) : null,
        height: newStructure.height ? parseFloat(newStructure.height.toString()) : null,
        coating_material_id: newStructure.coating_material_id || null,
        coating_thickness: newStructure.coating_thickness ? parseFloat(newStructure.coating_thickness.toString()) : null,
        coating_thickness_unit: newStructure.coating_thickness_unit || null,
        construction_year: newStructure.construction_year ? parseInt(newStructure.construction_year.toString()) : null,
        hidden_id: generateHiddenId()
      };

      const { error } = await supabase
        .from('neighboring_structures')
        .insert(structureData);

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

  useKeyAction(() => {
    if (editingStructure) {
      handleUpdateSaveStructure(structures.find(s => s.id === editingStructure)!);
    } else if (isNewStructure) {
      handleAddNewStructure();
    }
  }, editingStructure !== null || isNewStructure, "Enter", 500);

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
                    Depth (m)
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Height (m)
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Coating
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Construction Year
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
                        <FormHandler
                          isEditing={true}
                          onSave={() => handleUpdateSaveStructure(structure)}
                          onCancel={() => {
                            setEditingStructure(null);
                            setEditingValues({});
                          }}
                        >
                        <FormInput
                          value={editingValues.name || ''}
                          onChange={(e) => handleChangeEditingValues('name', e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                        </FormHandler>
                      ) : (
                        structure.name
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingStructure === structure.id ? (
                        <FormInput
                          type="number"
                          value={editingValues.depth || ''}
                          onChange={(e) => handleChangeEditingValues('depth', e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          min="0"
                          step="0.1"
                          placeholder="Enter depth"
                        />
                      ) : (
                        structure.depth || '-'
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingStructure === structure.id ? (
                        <FormInput
                          type="number"
                          value={editingValues.height || ''}
                          onChange={(e) => handleChangeEditingValues('height', e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          min="0"
                          step="0.1"
                          placeholder="Enter height"
                        />
                      ) : (
                        structure.height || '-'
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingStructure === structure.id ? (
                        <div className="flex gap-2">
                          <FormSelect
                            value={editingValues.coating_material_id || ''}
                            onChange={(e) => handleChangeEditingValues('coating_material_id', e.target.value)}
                            className="flex-1 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          >
                            <option value="">Select coating material</option>
                            {materials.map(material => (
                              <option key={material.id} value={material.id}>
                                {material.name}
                              </option>
                            ))}
                          </FormSelect>
                          <FormInput
                            type="number"
                            value={editingValues.coating_thickness || ''}
                            onChange={(e) => handleChangeEditingValues('coating_thickness', e.target.value)}
                            className="w-24 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                            min="0"
                            step="0.1"
                            placeholder="Thickness"
                          />
                          <FormSelect
                            value={editingValues.coating_thickness_unit || 'mm'}
                            onChange={(e) => handleChangeEditingValues('coating_thickness_unit', e.target.value)}
                            className="w-20 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          >
                            <option value="mm">mm</option>
                            <option value="μm">μm</option>
                          </FormSelect>
                        </div>
                      ) : (
                        structure.coating_material_id ? (
                          <div>
                            {materials.find(m => m.id === structure.coating_material_id)?.name}
                            {structure.coating_thickness && (
                              <span className="ml-2">
                                ({structure.coating_thickness} {structure.coating_thickness_unit || 'mm'})
                              </span>
                            )}
                          </div>
                        ) : '-'
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingStructure === structure.id ? (
                        <FormInput
                          type="number"
                          value={editingValues.construction_year || ''}
                          onChange={(e) => handleChangeEditingValues('construction_year', e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          min="1800"
                          max={new Date().getFullYear()}
                          placeholder="Enter year"
                        />
                      ) : (
                        structure.construction_year || '-'
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
                            editingStructure ? (
                              <X size={14} />
                            ) : (
                              <Edit2 size={14} />
                            )
                          )}
                        </button>
                        {!editingStructure && (
                          <button 
                            onClick={() => {
                              setDeleteConfirm(structure.id);
                              setDeleteConfirmName('');
                            }}
                            className="p-1 rounded hover:bg-opacity-80 text-secondary"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {isNewStructure && (
                  <tr>
                    <td className="p-2 border border-theme">
                      <FormHandler
                        isEditing={true}
                        onSave={handleAddNewStructure}
                        onCancel={handleCancelNewStructure}
                      >
                      <FormInput
                        type="text"
                        value={newStructure.name || ''}
                        onChange={(e) => handleChangeNewStructure('name', e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        placeholder="Enter structure name"
                      />
                      </FormHandler>
                    </td>
                    <td className="p-2 border border-theme">
                      <FormInput
                        type="number"
                        value={newStructure.depth || ''}
                        onChange={(e) => handleChangeNewStructure('depth', e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        min="0"
                        step="0.1"
                        placeholder="Enter depth"
                      />
                    </td>
                    <td className="p-2 border border-theme">
                      <FormInput
                        type="number"
                        value={newStructure.height || ''}
                        onChange={(e) => handleChangeNewStructure('height', e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        min="0"
                        step="0.1"
                        placeholder="Enter height"
                      />
                    </td>
                    <td className="p-2 border border-theme">
                      <div className="flex gap-2">
                        <FormSelect
                          value={newStructure.coating_material_id || ''}
                          onChange={(e) => handleChangeNewStructure('coating_material_id', e.target.value)}
                          className="flex-1 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        >
                          <option value="">Select coating material</option>
                          {materials.map(material => (
                            <option key={material.id} value={material.id}>
                              {material.name}
                            </option>
                          ))}
                        </FormSelect>
                        <FormInput
                          type="number"
                          value={newStructure.coating_thickness || ''}
                          onChange={(e) => handleChangeNewStructure('coating_thickness', e.target.value)}
                          className="w-24 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          min="0"
                          step="0.1"
                          placeholder="Thickness"
                        />
                        <FormSelect
                          value={newStructure.coating_thickness_unit || 'mm'}
                          onChange={(e) => handleChangeNewStructure('coating_thickness_unit', e.target.value)}
                          className="w-20 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        >
                          <option value="mm">mm</option>
                          <option value="μm">μm</option>
                        </FormSelect>
                      </div>
                    </td>
                    <td className="p-2 border border-theme">
                      <FormInput
                        type="number"
                        value={newStructure.construction_year || ''}
                        onChange={(e) => handleChangeNewStructure('construction_year', e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        min="1800"
                        max={new Date().getFullYear()}
                        placeholder="Enter year"
                      />
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

      <DeleteConfirmDialog
        isOpen={!!deleteConfirm}
        itemName="Structure"
        confirmName={deleteConfirmName}
        onConfirmChange={setDeleteConfirmName}
        onConfirm={() => handleDeleteStructure(deleteConfirm!)}
        onCancel={() => {
          setDeleteConfirm(null);
          setDeleteConfirmName('');
        }}
      />
    </div>
  );
};

export default NeighboringStructuresManagement;