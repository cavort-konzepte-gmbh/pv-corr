import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Edit2, X, Save } from 'lucide-react';
import { FormHandler, FormInput, FormSelect, DeleteConfirmDialog } from '../shared/FormHandler';
import { useKeyAction } from '../../hooks/useKeyAction';
import { generateHiddenId } from '../../utils/generateHiddenId';
import { TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, Table } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

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
  const [materials, setMaterials] = useState<{ id: string; name: string }[]>([]);
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
      const { data, error } = await supabase.from('materials').select('id, name').order('name', { ascending: true });

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
      const { data, error } = await supabase.from('neighboring_structures').select('*').order('created_at', { ascending: true });

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
    setEditingValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeNewStructure = (field: keyof NeighboringStructure, value: string) => {
    setNewStructure((prev) => ({
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
          construction_year: editingValues.construction_year ? parseInt(editingValues.construction_year.toString()) : null,
        };

        const { error } = await supabase.from('neighboring_structures').update(updateData).eq('id', structure.id);

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
      const structure = structures.find((s) => s.id === structureId);
      if (!structure) return;

      // Only proceed if name matches
      if (deleteConfirmName !== structure.name) {
        setError('Structure name does not match');
        return;
      }

      const { error } = await supabase.from('neighboring_structures').delete().eq('id', structureId);

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
        hidden_id: generateHiddenId(),
      };

      const { error } = await supabase.from('neighboring_structures').insert(structureData);

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

  useKeyAction(
    () => {
      if (editingStructure) {
        handleUpdateSaveStructure(structures.find((s) => s.id === editingStructure)!);
      } else if (isNewStructure) {
        handleAddNewStructure();
      }
    },
    editingStructure !== null || isNewStructure,
    'Enter',
    500,
  );

  return (
    <div className="p-8">
      {error && <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>}

      <div className="flex items-center gap-4 mb-8">
        <Button onClick={onBack} className="p-2 rounded hover:bg-opacity-80" variant="ghost">
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold">Neighboring Structures Management</h2>
      </div>

      {loading ? (
        <div className="text-center p-4">Loading neighboring structures...</div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg">Neighboring Structures</h3>
            <Button onClick={handleOpenNewStructure} className="px-3 py-1">
              <Plus size={14} />
              Add Structure
            </Button>
          </div>

          <section className="border border-input rounded-md bg-card">
            <div className="w-full relative overflow-auto">
              <Table>
                <TableCaption>Neighboring Structures</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Depth (m)</TableHead>
                    <TableHead>Height (m)</TableHead>
                    <TableHead>Coating</TableHead>
                    <TableHead>Construction Year</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell className="p-2">
                        {editingStructure === structure.id ? (
                          <FormHandler
                            isEditing={true}
                            onSave={() => handleUpdateSaveStructure(structure)}
                            onCancel={() => {
                              setEditingStructure(null);
                              setEditingValues({});
                            }}
                          >
                            <Input
                              value={editingValues.name || ''}
                              onChange={(e) => handleChangeEditingValues('name', e.target.value)}
                              className="w-full p-1"
                            />
                          </FormHandler>
                        ) : (
                          structure.name
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        {editingStructure === structure.id ? (
                          <Input
                            type="number"
                            value={editingValues.depth || ''}
                            onChange={(e) => handleChangeEditingValues('depth', e.target.value)}
                            className="w-full p-1"
                            min="0"
                            step="0.1"
                            placeholder="Enter depth"
                          />
                        ) : (
                          structure.depth || '-'
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        {editingStructure === structure.id ? (
                          <Input
                            type="number"
                            value={editingValues.height || ''}
                            onChange={(e) => handleChangeEditingValues('height', e.target.value)}
                            className="w-full p-1"
                            min="0"
                            step="0.1"
                            placeholder="Enter height"
                          />
                        ) : (
                          structure.height || '-'
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        {editingStructure === structure.id ? (
                          <div className="flex gap-2">
                            <FormSelect
                              value={editingValues.coating_material_id || ''}
                              onChange={(e) => handleChangeEditingValues('coating_material_id', e.target.value)}
                              className="flex-1 p-1"
                            >
                              <option value="">Select coating material</option>
                              {materials.map((material) => (
                                <option key={material.id} value={material.id}>
                                  {material.name}
                                </option>
                              ))}
                            </FormSelect>
                            <Input
                              type="number"
                              value={editingValues.coating_thickness || ''}
                              onChange={(e) => handleChangeEditingValues('coating_thickness', e.target.value)}
                              className="w-24 p-1"
                              min="0"
                              step="0.1"
                              placeholder="Thickness"
                            />
                            <FormSelect
                              value={editingValues.coating_thickness_unit || 'mm'}
                              onChange={(e) => handleChangeEditingValues('coating_thickness_unit', e.target.value)}
                              className="w-20 p-1"
                            >
                              <option value="mm">mm</option>
                              <option value="μm">μm</option>
                            </FormSelect>
                          </div>
                        ) : structure.coating_material_id ? (
                          <div>
                            {materials.find((m) => m.id === structure.coating_material_id)?.name}
                            {structure.coating_thickness && (
                              <span className="ml-2">
                                ({structure.coating_thickness} {structure.coating_thickness_unit || 'mm'})
                              </span>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        {editingStructure === structure.id ? (
                          <Input
                            type="number"
                            value={editingValues.construction_year || ''}
                            onChange={(e) => handleChangeEditingValues('construction_year', e.target.value)}
                            className="w-full p-1"
                            min="1800"
                            max={new Date().getFullYear()}
                            placeholder="Enter year"
                          />
                        ) : (
                          structure.construction_year || '-'
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleUpdateSaveStructure(structure)}
                            className="p-1 rounded hover:bg-opacity-80"
                            variant="ghost"
                          >
                            {editingStructure === structure.id ? (
                              <Save size={14} />
                            ) : editingStructure ? (
                              <X size={14} />
                            ) : (
                              <Edit2 size={14} />
                            )}
                          </Button>
                          {!editingStructure && (
                            <Button
                              onClick={() => {
                                setDeleteConfirm(structure.id);
                                setDeleteConfirmName('');
                              }}
                              className="p-1 rounded hover:bg-opacity-80"
                              variant="ghost"
                            >
                              <X size={14} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {isNewStructure && (
                    <TableRow>
                      <TableCell className="p-2">
                        <FormHandler isEditing={true} onSave={handleAddNewStructure} onCancel={handleCancelNewStructure}>
                          <Input
                            type="text"
                            value={newStructure.name || ''}
                            onChange={(e) => handleChangeNewStructure('name', e.target.value)}
                            className="w-full p-1"
                            placeholder="Enter structure name"
                          />
                        </FormHandler>
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={newStructure.depth || ''}
                          onChange={(e) => handleChangeNewStructure('depth', e.target.value)}
                          className="w-full p-1"
                          min="0"
                          step="0.1"
                          placeholder="Enter depth"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={newStructure.height || ''}
                          onChange={(e) => handleChangeNewStructure('height', e.target.value)}
                          className="w-full p-1"
                          min="0"
                          step="0.1"
                          placeholder="Enter height"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex gap-2">
                          <FormSelect
                            value={newStructure.coating_material_id || ''}
                            onChange={(e) => handleChangeNewStructure('coating_material_id', e.target.value)}
                            className="w-[60%] p-2"
                          >
                            <option value="">Select coating material</option>
                            {materials.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.name}
                              </option>
                            ))}
                          </FormSelect>
                          <Input
                            type="number"
                            value={newStructure.coating_thickness || ''}
                            onChange={(e) => handleChangeNewStructure('coating_thickness', e.target.value)}
                            className="w-[25%] p-2"
                            min="0"
                            step="0.1"
                            placeholder="Thickness"
                          />
                          <FormSelect
                            value={newStructure.coating_thickness_unit || 'mm'}
                            onChange={(e) => handleChangeNewStructure('coating_thickness_unit', e.target.value)}
                            className="w-[15%] p-2"
                          >
                            <option value="mm">mm</option>
                            <option value="μm">μm</option>
                          </FormSelect>
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={newStructure.construction_year || ''}
                          onChange={(e) => handleChangeNewStructure('construction_year', e.target.value)}
                          className="w-full p-1"
                          min="1800"
                          max={new Date().getFullYear()}
                          placeholder="Enter year"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button onClick={handleAddNewStructure} variant="ghost">
                            <Save className="text-primary" size={14} />
                          </Button>
                          <Button onClick={handleCancelNewStructure} variant="ghost">
                            <X className="text-primary" size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
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
