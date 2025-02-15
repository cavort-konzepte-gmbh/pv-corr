import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Edit2, X, Link } from 'lucide-react';
import { generateHiddenId } from '../../utils/generateHiddenId';

interface SubstructuresManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

interface Manufacturer {
  id: string;
  name: string;
}

interface SubstructureSystem {
  id: string;
  name: string;
  manufacturer_id: string;
}

interface SubstructureVersion {
  id: string;
  system_id: string;
  name: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: 'schematic' | 'example';
  title?: string;
  description?: string;
}

interface Substructure {
  id: string;
  hidden_id: string;
  manufacturer_id: string;
  system_id: string;
  version_id: string;
  type: 'roof' | 'field';
  link?: string;
}

const SubstructuresManagement: React.FC<SubstructuresManagementProps> = ({ currentTheme, onBack }) => {
  const [substructures, setSubstructures] = useState<Substructure[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [systems, setSystems] = useState<SubstructureSystem[]>([]);
  const [versions, setVersions] = useState<SubstructureVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<Substructure>>({});
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [showNewManufacturer, setShowNewManufacturer] = useState(false);
  const [newManufacturerName, setNewManufacturerName] = useState('');
  const [showNewSystem, setShowNewSystem] = useState(false);
  const [newSystemName, setNewSystemName] = useState('');
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const handleAddManufacturer = async () => {
    if (!newManufacturerName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .insert({ name: newManufacturerName.trim() })
        .select()
        .single();

      if (error) throw error;
      await loadData();
      setFormValues(prev => ({ ...prev, manufacturer_id: data.id }));
      setShowNewManufacturer(false);
      setNewManufacturerName('');
    } catch (err) {
      console.error('Error adding manufacturer:', err);
      setError('Failed to add manufacturer');
    }
  };

  const handleAddSystem = async () => {
    if (!formValues.manufacturer_id || !newSystemName.trim()) {
      setDialogError('Please select a manufacturer and enter a system name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('substructure_systems')
        .insert({
          name: newSystemName.trim(),
          manufacturer_id: formValues.manufacturer_id
        })
        .select()
        .single();

      if (error) throw error;
      await loadData();
      setFormValues(prev => ({ ...prev, system_id: data.id }));
      setShowNewSystem(false);
      setNewSystemName('');
    } catch (err) {
      console.error('Error adding system:', err);
      setDialogError('Failed to add system');
    }
  };

  const handleAddVersion = async () => {
    if (!formValues.system_id || !newVersionName.trim()) {
      setError('Please select a system and enter a version name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('substructure_versions')
        .insert({
          name: newVersionName.trim(),
          system_id: formValues.system_id
        })
        .select()
        .single();

      if (error) throw error;
      await loadData();
      setFormValues(prev => ({ ...prev, version_id: data.id }));
      setShowNewVersion(false);
      setNewVersionName('');
    } catch (err) {
      console.error('Error adding version:', err);
      setError('Failed to add version');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        { data: subData, error: subError }, 
        { data: mfgData, error: mfgError },
        { data: sysData, error: sysError },
        { data: verData, error: verError }
      ] = await Promise.all([
        supabase
        .from('substructures_view')
        .select('*')
        .order('created_at', { ascending: true }),
        supabase
        .from('manufacturers')
        .select('*')
        .order('name', { ascending: true }),
        supabase
        .from('substructure_systems')
        .select('*')
        .order('name', { ascending: true }),
        supabase
        .from('substructure_versions')
        .select('*')
        .order('name', { ascending: true })
      ]);

      if (subError) throw subError;
      if (mfgError) throw mfgError;
      if (sysError) throw sysError;
      if (verError) throw verError;
      
      setSubstructures(subData || []);
      setManufacturers(mfgData || []);
      setSystems(sysData || []);
      setVersions(verData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formValues.manufacturer_id || !formValues.system_id || !formValues.version_id || !formValues.type) {
        setError('Please fill in all required fields');
        return;
      }

      const data = {
        ...formValues,
        hidden_id: generateHiddenId(),
        manufacturer_id: formValues.manufacturer_id,
        system_id: formValues.system_id,
        version_id: formValues.version_id,
        type: formValues.type || 'field'
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
      setError('Failed to delete substructure. Please try again.');
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
          className="text-2xl font-bold flex items-center gap-2"
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

      {showNewForm ? (
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
                <div className="flex gap-2">
                  <select
                    value={formValues.manufacturer_id || ''}
                    onChange={(e) => {
                      setFormValues({ 
                        ...formValues, 
                        manufacturer_id: e.target.value,
                        // Clear dependent fields when manufacturer changes
                        system_id: '',
                        version_id: ''
                      });
                    }}
                    className="flex-1 p-2 rounded text-sm" 
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text.primary,
                      border: `1px solid ${currentTheme.colors.border}`
                    }}
                  >
                    <option value="">Select manufacturer</option>
                    {manufacturers.map(mfg => (
                      <option key={mfg.id} value={mfg.id}>
                        {mfg.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewManufacturer(true)}
                    className="px-3 py-1 rounded text-sm"
                    style={{ 
                      backgroundColor: currentTheme.colors.accent.primary,
                      color: 'white'
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }} 
                >
                  System
                </label>
                <div className="flex gap-2">
                  <select
                    value={formValues.system_id || ''}
                    onChange={(e) => {
                      setFormValues({ 
                        ...formValues, 
                        system_id: e.target.value,
                        // Clear dependent version when system changes
                        version_id: ''
                      });
                    }}
                    className="flex-1 p-2 rounded text-sm" 
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text.primary,
                      border: `1px solid ${currentTheme.colors.border}`
                    }}
                  >
                    <option value="">Select system</option>
                    {systems
                      .filter(sys => sys.manufacturer_id === formValues.manufacturer_id)
                      .map(sys => (
                        <option key={sys.id} value={sys.id}>
                          {sys.name}
                        </option>
                      ))
                    }
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewSystem(true)}
                    className="px-3 py-1 rounded text-sm"
                    style={{ 
                      backgroundColor: currentTheme.colors.accent.primary,
                      color: 'white'
                    }}
                    disabled={!formValues.manufacturer_id}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }} 
                >
                  Version
                </label>
                <div className="flex gap-2">
                  <select
                    value={formValues.version_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, version_id: e.target.value })}
                    className="flex-1 p-2 rounded text-sm" 
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text.primary,
                      border: `1px solid ${currentTheme.colors.border}`
                    }}
                  >
                    <option value="">Select version</option>
                    {versions
                      .filter(ver => ver.system_id === formValues.system_id)
                      .map(ver => (
                        <option key={ver.id} value={ver.id}>
                          {ver.name}
                        </option>
                      ))
                    }
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewVersion(true)}
                    className="px-3 py-1 rounded text-sm"
                    style={{ 
                      backgroundColor: currentTheme.colors.accent.primary,
                      color: 'white'
                    }}
                    disabled={!formValues.system_id}
                  >
                    <Plus size={14} />
                  </button>
                </div>
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
                  Link URL
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
                  placeholder="Optional URL"
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowNewForm(false);
                    setEditingId(null);
                    setFormValues({});
                  }}
                  className="px-4 py-2 rounded text-sm"
                  style={{ 
                    color: currentTheme.colors.text.secondary
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
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* New Manufacturer Dialog */}
      {showNewManufacturer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div 
            className="p-6 rounded-lg max-w-md w-full"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 
              className="text-lg mb-6"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Add New Manufacturer
            </h3>
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={newManufacturerName}
                  onChange={(e) => setNewManufacturerName(e.target.value)}
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
                    setShowNewManufacturer(false);
                    setNewManufacturerName('');
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
                  onClick={handleAddManufacturer}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.accent.primary,
                    color: 'white'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New System Dialog */}
      {showNewSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div 
            className="p-6 rounded-lg max-w-md w-full"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 
              className="text-lg mb-6"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Add New System
            </h3>

            {dialogError && (
              <div 
                className="p-4 mb-4 rounded"
                style={{ 
                  backgroundColor: `${currentTheme.colors.accent.primary}20`,
                  color: currentTheme.colors.accent.primary,
                  border: `1px solid ${currentTheme.colors.accent.primary}`
                }}
              >
                {dialogError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={newSystemName}
                  onChange={(e) => setNewSystemName(e.target.value)}
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
                    setShowNewSystem(false);
                    setNewSystemName('');
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
                  onClick={handleAddSystem}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.accent.primary,
                    color: 'white'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Version Dialog */}
      {showNewVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div 
            className="p-6 rounded-lg max-w-md w-full"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 
              className="text-lg mb-6"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Add New Version
            </h3>
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
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
                    setShowNewVersion(false);
                    setNewVersionName('');
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
                  onClick={handleAddVersion}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.accent.primary,
                    color: 'white'
                  }}
                >
                  Add
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
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ color: currentTheme.colors.text.primary }}>
                    {manufacturers.find(m => m.id === substructure.manufacturer_id)?.name} - {systems.find(s => s.id === substructure.system_id)?.name} ({versions.find(v => v.id === substructure.version_id)?.name})
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
                  type="button"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 mt-2 items-center">
              {substructure.link && (
                <a
                  href={substructure.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 hover:underline"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  <Link size={12} />
                  Website
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