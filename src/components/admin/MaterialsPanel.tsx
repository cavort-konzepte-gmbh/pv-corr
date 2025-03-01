import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Save, X } from 'lucide-react';
import { generateHiddenId } from '../../utils/generateHiddenId';

interface MaterialsPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
}

interface Material {
  id: string;
  hidden_id: string;
  name: string;
  e_potential: number | null;
  valency: number | null;
  molar_mass: number | null;
}

export const MaterialsPanel: React.FC<MaterialsPanelProps> = ({ 
  currentTheme,
  currentLanguage
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isNewMaterial, setIsNewMaterial] = useState<boolean>(false);
  const [newMaterial, setNewMaterial] = useState<Record<string, string>>({});
  const t = useTranslation(currentLanguage);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      console.error('Error loading materials:', err);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEditingValues = (name: string, value: string) => {
    setEditingValues(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleChangeMaterial = (name: string, value: string) => {
    setNewMaterial(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetValues = () => {
    setEditingValues({});
    setEditingMaterial(null);
  };

  const handleUpdateSaveMaterial = async (material: Material) => {
    if (editingMaterial === material.id) {
      try {
        // Validate numeric fields
        const e_potential = editingValues.e_potential ? parseFloat(editingValues.e_potential) : null;
        const valency = editingValues.valency ? parseFloat(editingValues.valency) : null;
        const molar_mass = editingValues.molar_mass ? parseFloat(editingValues.molar_mass) : null;

        const { error } = await supabase
          .from('materials')
          .update({ 
            name: editingValues.name,
            e_potential,
            valency,
            molar_mass
          })
          .eq('id', material.id);

        if (error) throw error;
        await loadData();
        resetValues();
      } catch (err) {
        console.error('Error updating material:', err);
        setError('Failed to update material');
      }
    } else {
      setEditingMaterial(material.id);
      setEditingValues(material);
      setNewMaterial({});
      setIsNewMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error deleting material:', err);
      setError('Failed to delete material');
    }
  };

  const handleOpenMaterial = () => {
    resetValues();
    setIsNewMaterial(true);
  };

  const handleAddNewMaterial = async () => {
    try {
      // Validate numeric fields
      const e_potential = newMaterial.e_potential ? parseFloat(newMaterial.e_potential) : null;
      const valency = newMaterial.valency ? parseFloat(newMaterial.valency) : null;
      const molar_mass = newMaterial.molar_mass ? parseFloat(newMaterial.molar_mass) : null;

      const { error } = await supabase
        .from('materials')
        .insert({
          name: newMaterial.name,
          e_potential,
          valency,
          molar_mass,
          hidden_id: generateHiddenId()
        });

      if (error) throw error;
      await loadData();
      resetValues();
      setNewMaterial({});
      setIsNewMaterial(false);
    } catch (err) {
      console.error('Error creating material:', err);
      setError('Failed to create material');
    }
  };

  const handleCancelNewMaterial = () => {
    resetValues();
    setNewMaterial({});
    setIsNewMaterial(false);
  };

  return (
    <div className="p-6">
      {error && (
        <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-4 text-secondary">
          Loading materials...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg text-primary">
              Materials
            </h3>
            <button
              onClick={handleOpenMaterial}
              className="px-3 py-1 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
            >
              <Plus size={14} />
              Add Material
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
                    E-Potential
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Valency
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Molar Mass
                  </th>
                  <th className="p-2 text-center border font-normal border-theme">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td className="p-2 border border-theme">
                      {editingMaterial === material.id ? (
                        <input
                          type="text"
                          name="name"
                          value={editingValues.name || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : (
                        material.name
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingMaterial === material.id ? (
                        <input
                          type="number"
                          name="e_potential"
                          value={editingValues.e_potential || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          step="any"
                        />
                      ) : (
                        material.e_potential
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingMaterial === material.id ? (
                        <input
                          type="number"
                          name="valency"
                          value={editingValues.valency || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          step="any"
                        />
                      ) : (
                        material.valency
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingMaterial === material.id ? (
                        <input
                          type="number"
                          name="molar_mass"
                          value={editingValues.molar_mass || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                          step="any"
                        />
                      ) : (
                        material.molar_mass
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateSaveMaterial(material)}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          {editingMaterial === material.id ? (
                            <Save size={14} />
                          ) : (
                            <Edit2 size={14} />
                          )}
                        </button>
                        <button onClick={() => handleDeleteMaterial(material.id)}>
                          <X className="text-secondary" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {isNewMaterial && (
                  <tr>
                    <td className="p-2 border border-theme">
                      <input
                        type="text"
                        name="name"
                        value={newMaterial.name || ''}
                        onChange={(e) => handleChangeMaterial(e.target.name, e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        placeholder="Enter material name"
                      />
                    </td>
                    <td className="p-2 border border-theme">
                      <input
                        type="number"
                        name="e_potential"
                        value={newMaterial.e_potential || ''}
                        onChange={(e) => handleChangeMaterial(e.target.name, e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        placeholder="Enter E-Potential"
                        step="any"
                      />
                    </td>
                    <td className="p-2 border border-theme">
                      <input
                        type="number"
                        name="valency"
                        value={newMaterial.valency || ''}
                        onChange={(e) => handleChangeMaterial(e.target.name, e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        placeholder="Enter Valency"
                        step="any"
                      />
                    </td>
                    <td className="p-2 border border-theme">
                      <input
                        type="number"
                        name="molar_mass"
                        value={newMaterial.molar_mass || ''}
                        onChange={(e) => handleChangeMaterial(e.target.name, e.target.value)}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        placeholder="Enter Molar Mass"
                        step="any"
                      />
                    </td>
                    <td className="p-2 border border-theme">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={handleAddNewMaterial}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={handleCancelNewMaterial}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
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