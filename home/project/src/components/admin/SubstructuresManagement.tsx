import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Edit2, X, Link, Image } from 'lucide-react';
import { generateHiddenId } from '../../utils/generateHiddenId';

interface SubstructuresManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

interface Substructure {
  id: string;
  manufacturer: string;
  system: string;
  version: string;
  type: 'roof' | 'field';
  link?: string;
  schematic?: string;
  example?: string;
}

const SubstructuresManagement: React.FC<SubstructuresManagementProps> = ({ currentTheme, onBack }) => {
  const [substructures, setSubstructures] = useState<Substructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<Substructure>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('substructures')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubstructures(data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formValues.manufacturer || !formValues.system || !formValues.version || !formValues.type) {
        setError('Please fill in all required fields');
        return;
      }

      const data = {
        ...formValues,
        hidden_id: generateHiddenId()
      };

      if (editingId) {
        const { error } = await supabase
          .from('substructures')
          .update(data)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('substructures')
          .insert(data);

        if (error) throw error;
      }

      await loadData();
      setShowNewForm(false);
      setEditingId(null);
      setFormValues({});
    } catch (err) {
      console.error('Error saving substructure:', err);
      setError('Failed to save substructure');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('substructures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error deleting substructure:', err);
      setError('Failed to delete substructure');
    }
  };

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
          Substructures Management
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
        onClick={() => setShowNewForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6"
        style={{ 
          backgroundColor: currentTheme.colors.accent.primary,
          color: 'white'
        }}
      >
        <Plus size={16} />
        Add New Substructure
      </button>

      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div 
            className="p-6 rounded-lg max-w-md w-full"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 
              className="text-lg mb-6"
              style={{ color: currentTheme.colors.text.primary }}
            >
              {editingId ? 'Edit Substructure' : 'New Substructure'}
            </h3>

            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formValues.manufacturer || ''}
                  onChange={(e) => setFormValues({ ...formValues, manufacturer: e.target.value })}
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  System
                </label>
                <input
                  type="text"
                  value={formValues.system || ''}
                  onChange={(e) => setFormValues({ ...formValues, system: e.target.value })}
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Version
                </label>
                <input
                  type="text"
                  value={formValues.version || ''}
                  onChange={(e) => setFormValues({ ...formValues, version: e.target.value })}
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Type
                </label>
                <select
                  value={formValues.type || ''}
                  onChange={(e) => setFormValues({ ...formValues, type: e.target.value as 'roof' | 'field' })}
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  <option value="">Select type</option>
                  <option value="roof">Roof</option>
                  <option value="field">Field</option>
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Link
                </label>
                <input
                  type="url"
                  value={formValues.link || ''}
                  onChange={(e) => setFormValues({ ...formValues, link: e.target.value })}
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Schematic URL
                </label>
                <input
                  type="url"
                  value={formValues.schematic || ''}
                  onChange={(e) => setFormValues({ ...formValues, schematic: e.target.value })}
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Example URL
                </label>
                <input
                  type="url"
                  value={formValues.example || ''}
                  onChange={(e) => setFormValues({ ...formValues, example: e.target.value })}
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNewForm(false);
                    setEditingId(null);
                    setFormValues({});
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
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.accent.primary,
                    color: 'white'
                  }}
                >
                  {editingId ? 'Save Changes' : 'Create Substructure'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {substructures.map(substructure => (
          <div
            key={substructure.id}
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ color: currentTheme.colors.text.primary }}>
                    {substructure.manufacturer} - {substructure.system} ({substructure.version})
                  </span>
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: `${currentTheme.colors.accent.primary}20`,
                      color: currentTheme.colors.accent.primary
                    }}
                  >
                    {substructure.type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingId(substructure.id);
                    setFormValues(substructure);
                    setShowNewForm(true);
                  }}
                  className="p-1 rounded hover:bg-opacity-80"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(substructure.id)}
                  className="p-1 rounded hover:bg-opacity-80"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              {substructure.link && (
                <a
                  href={substructure.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-1"
                  style={{ color: currentTheme.colors.accent.primary }}
                >
                  <Link size={12} />
                  Website
                </a>
              )}
              {substructure.schematic && (
                <a
                  href={substructure.schematic}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-1"
                  style={{ color: currentTheme.colors.accent.primary }}
                >
                  <Image size={12} />
                  Schematic
                </a>
              )}
              {substructure.example && (
                <a
                  href={substructure.example}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-1"
                  style={{ color: currentTheme.colors.accent.primary }}
                >
                  <Image size={12} />
                  Example
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubstructuresManagement;