import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Edit2, Save, X } from 'lucide-react';
import { FormHandler, FormInput } from '../shared/FormHandler';
import { useKeyAction } from '../../hooks/useKeyAction';
import { generateHiddenId } from '../../utils/generateHiddenId';

interface ExpertsManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

interface Expert {
  id: string;
  hidden_id: string;
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  vat_id?: string;
  registration_number?: string;
}

const ExpertsManagement: React.FC<ExpertsManagementProps> = ({ currentTheme, onBack }) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExpert, setEditingExpert] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<Expert>>({});
  const [isNewExpert, setIsNewExpert] = useState(false);
  const [newExpert, setNewExpert] = useState<Partial<Expert>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setExperts(data || []);
    } catch (err) {
      console.error('Error loading experts:', err);
      setError('Failed to load experts');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEditingValues = (field: keyof Expert, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeNewExpert = (field: keyof Expert, value: string) => {
    setNewExpert(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetValues = () => {
    setEditingValues({});
    setEditingExpert(null);
  };

  const handleUpdateSaveExpert = async (expert: Expert) => {
    if (editingExpert === expert.id) {
      try {
        if (!editingValues.name?.trim()) {
          setError('Name is required');
          return;
        }

        const { error } = await supabase
          .from('experts')
          .update(editingValues)
          .eq('id', expert.id);

        if (error) throw error;
        await loadData();
        resetValues();
      } catch (err) {
        console.error('Error updating expert:', err);
        setError('Failed to update expert');
      }
    } else {
      setEditingExpert(expert.id);
      setEditingValues(expert);
      setNewExpert({});
      setIsNewExpert(false);
    }
  };

  const handleAddNewExpert = async () => {
    try {
      if (!newExpert.name?.trim()) {
        setError('Name is required');
        return;
      }

      const expertData = {
        ...newExpert,
        hidden_id: generateHiddenId()
      };

      const { error } = await supabase
        .from('experts')
        .insert(expertData);

      if (error) throw error;

      await loadData();
      resetValues();
      setNewExpert({});
      setIsNewExpert(false);
    } catch (err) {
      console.error('Error saving expert:', err);
      setError('Failed to save expert');
    }
  };

  const handleCancelNewExpert = () => {
    resetValues();
    setNewExpert({});
    setIsNewExpert(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('experts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error deleting expert:', err);
      setError('Failed to delete expert');
    }
  };

  useKeyAction(() => {
    if (editingExpert) {
      handleUpdateSaveExpert(experts.find(e => e.id === editingExpert)!);
    }
  }, editingExpert !== null || isNewExpert, "Enter", 500);

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded hover:bg-opacity-80"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 
          className="text-2xl font-bold"
          style={{ color: currentTheme.colors.text.primary }}
        >
          Experts Management
        </h2>
      </div>

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

      <button
        onClick={() => setIsNewExpert(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6"
        style={{ 
          backgroundColor: currentTheme.colors.accent.primary,
          color: 'white'
        }}
      >
        <Plus size={16} />
        Add New Expert
      </button>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-theme text-primary">
          <thead>
            <tr>
              <th className="p-2 text-left border font-normal border-theme">Name</th>
              <th className="p-2 text-left border font-normal border-theme">Website</th>
              <th className="p-2 text-left border font-normal border-theme">Email</th>
              <th className="p-2 text-left border font-normal border-theme">Phone</th>
              <th className="p-2 text-left border font-normal border-theme">VAT ID</th>
              <th className="p-2 text-left border font-normal border-theme">Reg. No.</th>
              <th className="p-2 text-center border font-normal border-theme">Actions</th>
            </tr>
          </thead>
          <tbody>
            {experts.map(expert => (
              <tr key={expert.id}>
                <td className="p-2 border border-theme">
                  {editingExpert === expert.id ? (
                    <FormHandler
                      isEditing={true}
                      onSave={() => handleUpdateSaveExpert(expert)}
                      onCancel={() => {
                        setEditingExpert(null);
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
                    expert.name
                  )}
                </td>
                <td className="p-2 border border-theme">
                  {editingExpert === expert.id ? (
                    <FormInput
                      type="url"
                      value={editingValues.website || ''}
                      onChange={(e) => handleChangeEditingValues('website', e.target.value)}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    />
                  ) : (
                    expert.website || '-'
                  )}
                </td>
                <td className="p-2 border border-theme">
                  {editingExpert === expert.id ? (
                    <FormInput
                      type="email"
                      value={editingValues.email || ''}
                      onChange={(e) => handleChangeEditingValues('email', e.target.value)}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    />
                  ) : (
                    expert.email || '-'
                  )}
                </td>
                <td className="p-2 border border-theme">
                  {editingExpert === expert.id ? (
                    <FormInput
                      type="tel"
                      value={editingValues.phone || ''}
                      onChange={(e) => handleChangeEditingValues('phone', e.target.value)}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    />
                  ) : (
                    expert.phone || '-'
                  )}
                </td>
                <td className="p-2 border border-theme">
                  {editingExpert === expert.id ? (
                    <FormInput
                      type="text"
                      value={editingValues.vat_id || ''}
                      onChange={(e) => handleChangeEditingValues('vat_id', e.target.value)}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    />
                  ) : (
                    expert.vat_id || '-'
                  )}
                </td>
                <td className="p-2 border border-theme">
                  {editingExpert === expert.id ? (
                    <FormInput
                      type="text"
                      value={editingValues.registration_number || ''}
                      onChange={(e) => handleChangeEditingValues('registration_number', e.target.value)}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    />
                  ) : (
                    expert.registration_number || '-'
                  )}
                </td>
                <td className="p-2 border border-theme">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleUpdateSaveExpert(expert)}
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      {editingExpert === expert.id ? (
                        <Save size={14} />
                      ) : (
                        <Edit2 size={14} />
                      )}
                    </button>
                    {!editingExpert && (
                      <button
                        onClick={() => handleDelete(expert.id)}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {isNewExpert && (
              <tr>
                <td className="p-2 border border-theme">
                  <FormHandler
                    isEditing={true}
                    onSave={handleAddNewExpert}
                    onCancel={handleCancelNewExpert}
                  >
                    <FormInput
                      type="text"
                      value={newExpert.name || ''}
                      onChange={(e) => handleChangeNewExpert('name', e.target.value)}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                      placeholder="Enter expert name"
                    />
                  </FormHandler>
                </td>
                <td className="p-2 border border-theme">
                  <FormInput
                    type="url"
                    value={newExpert.website || ''}
                    onChange={(e) => handleChangeNewExpert('website', e.target.value)}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder="Enter website URL"
                  />
                </td>
                <td className="p-2 border border-theme">
                  <FormInput
                    type="email"
                    value={newExpert.email || ''}
                    onChange={(e) => handleChangeNewExpert('email', e.target.value)}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder="Enter email"
                  />
                </td>
                <td className="p-2 border border-theme">
                  <FormInput
                    type="tel"
                    value={newExpert.phone || ''}
                    onChange={(e) => handleChangeNewExpert('phone', e.target.value)}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder="Enter phone"
                  />
                </td>
                <td className="p-2 border border-theme">
                  <FormInput
                    type="text"
                    value={newExpert.vat_id || ''}
                    onChange={(e) => handleChangeNewExpert('vat_id', e.target.value)}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder="Enter VAT ID"
                  />
                </td>
                <td className="p-2 border border-theme">
                  <FormInput
                    type="text"
                    value={newExpert.registration_number || ''}
                    onChange={(e) => handleChangeNewExpert('registration_number', e.target.value)}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder="Enter reg. no."
                  />
                </td>
                <td className="p-2 border border-theme">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={handleAddNewExpert}>
                      <Save size={14} />
                    </button>
                    <button onClick={handleCancelNewExpert}>
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
  );
};

export default ExpertsManagement;