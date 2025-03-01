import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Save, X, Info } from 'lucide-react';
import { generateHiddenId } from '../../utils/generateHiddenId';
import { Parameter } from '../../types/parameters';

interface NormsPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
}

interface Norm {
  id: string;
  hidden_id: string;
  name: string;
  description?: string;
  version?: string;
  parameters?: Parameter[];
}

interface NormParameter {
  norm_id: string;
  parameter_id: string;
  parameter_code: string;
  rating_ranges: RatingRange[];
}

interface RatingRange {
  min: number | string | null;
  max?: number | string | null;
  rating: number;
}

export const NormsPanel: React.FC<NormsPanelProps> = ({
  currentTheme,
  currentLanguage
}) => {
  const [norms, setNorms] = useState<Norm[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [normParameters, setNormParameters] = useState<NormParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNorm, setEditingNorm] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isNewNorm, setIsNewNorm] = useState(false);
  const [newNorm, setNewNorm] = useState<Record<string, string>>({});
  const t = useTranslation(currentLanguage);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [normsData, paramsData, normParamsData] = await Promise.all([
        supabase.from('norms').select('*').order('created_at', { ascending: true }),
        supabase.from('parameters').select('*').order('created_at', { ascending: true }),
        supabase.from('norm_parameters').select('*')
      ]);

      if (normsData.error) throw normsData.error;
      if (paramsData.error) throw paramsData.error;
      if (normParamsData.error) throw normParamsData.error;

      setNorms(normsData.data || []);
      setParameters(paramsData.data || []);
      setNormParameters(normParamsData.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
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

  const handleChangeNorm = (name: string, value: string) => {
    setNewNorm(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetValues = () => {
    setEditingValues({});
    setEditingNorm(null);
  };

  const handleUpdateSaveNorm = async (norm: Norm) => {
    if (editingNorm === norm.id) {
      try {
        const { error } = await supabase
          .from('norms')
          .update({ 
            name: editingValues.name,
            description: editingValues.description,
            version: editingValues.version
          })
          .eq('id', norm.id);

        if (error) throw error;
        await loadData();
        resetValues();
      } catch (err) {
        console.error('Error updating norm:', err);
        setError('Failed to update norm');
      }
    } else {
      setEditingNorm(norm.id);
      setEditingValues(norm);
      setNewNorm({});
      setIsNewNorm(false);
    }
  };

  const handleDeleteNorm = async (normId: string) => {
    try {
      const { error } = await supabase
        .from('norms')
        .delete()
        .eq('id', normId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error deleting norm:', err);
      setError('Failed to delete norm');
    }
  };

  const handleOpenNorm = () => {
    resetValues();
    setIsNewNorm(true);
  };

  const handleAddNewNorm = async () => {
    try {
      if (!newNorm.name?.trim()) {
        setError('Norm name is required');
        return;
      }

      const { error } = await supabase
        .from('norms')
        .insert({
          name: newNorm.name.trim(),
          description: newNorm.description?.trim(),
          version: newNorm.version?.trim(),
          hidden_id: generateHiddenId()
        });

      if (error) throw error;
      await loadData();
      resetValues();
      setNewNorm({});
      setIsNewNorm(false);
    } catch (err) {
      console.error('Error creating norm:', err);
      setError('Failed to create norm');
    }
  };

  const handleCancelNewNorm = () => {
    resetValues();
    setNewNorm({});
    setIsNewNorm(false);
  };

  const handleToggleParameter = async (normId: string, parameterId: string, parameterCode: string) => {
    try {
      const existingAssociation = normParameters.find(
        np => np.norm_id === normId && np.parameter_id === parameterId
      );

      if (existingAssociation) {
        // Remove association
        const { error } = await supabase
          .from('norm_parameters')
          .delete()
          .eq('norm_id', normId)
          .eq('parameter_id', parameterId);

        if (error) throw error;
      } else {
        // Add association
        const { error } = await supabase
          .from('norm_parameters')
          .insert({
            norm_id: normId,
            parameter_id: parameterId,
            parameter_code: parameterCode,
            rating_ranges: []
          });

        if (error) throw error;
      }

      await loadData();
    } catch (err) {
      console.error('Error toggling parameter:', err);
      setError('Failed to update parameter association');
    }
  };

  return (
    <div className="p-6">
      {error && (
        <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      <button
        onClick={() => setIsNewNorm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6 text-white bg-accent-primary"
      >
        <Plus size={16} />
        {t("standards.add")}
      </button>

      {loading ? (
        <div className="text-center p-4 text-secondary">
          Loading norms...
        </div>
      ) : (
        <div className="space-y-6">
          {isNewNorm ? (
            <div>
              <h3 className="text-lg mb-6 flex items-center gap-2 text-primary">
                {t("standards.new")}
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-secondary">
                    {t("standards.name")}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={newNorm.name || ''}
                    onChange={(e) => handleChangeNorm('name', e.target.value)}
                    className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-secondary">
                    Description
                  </label>
                  <textarea
                    value={newNorm.description || ''}
                    onChange={(e) => handleChangeNorm('description', e.target.value)}
                    className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-secondary">
                    Version
                  </label>
                  <input
                    type="text"
                    value={newNorm.version || ''}
                    onChange={(e) => handleChangeNorm('version', e.target.value)}
                    className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelNewNorm}
                    className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                  >
                    {t("actions.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewNorm}
                    className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                  >
                    {t("actions.save")}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {norms.map(norm => (
                <div
                  key={norm.id}
                  className="p-4 rounded-lg border transition-all text-primary border-theme border-solid bg-surface"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {editingNorm === norm.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingValues.name || ''}
                            onChange={(e) => handleChangeEditingValues('name', e.target.value)}
                            className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                          />
                          <input
                            type="text"
                            value={editingValues.version || ''}
                            onChange={(e) => handleChangeEditingValues('version', e.target.value)}
                            className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                            placeholder="Version"
                          />
                          <textarea
                            value={editingValues.description || ''}
                            onChange={(e) => handleChangeEditingValues('description', e.target.value)}
                            className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                            placeholder="Description"
                            rows={3}
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-medium text-lg">
                            {norm.name}
                            {norm.version && (
                              <span className="ml-2 text-sm text-secondary">
                                v{norm.version}
                              </span>
                            )}
                          </h3>
                          {norm.description && (
                            <p className="text-sm mt-1 text-secondary">
                              {norm.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateSaveNorm(norm)}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        {editingNorm === norm.id ? (
                          <Save size={14} />
                        ) : (
                          <Edit2 size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteNorm(norm.id)}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 text-secondary">
                      {t("standards.select_parameter")}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {parameters.map(param => {
                        const isSelected = normParameters.some(
                          np => np.norm_id === norm.id && np.parameter_id === param.id
                        );
                        return (
                          <div
                            key={param.id}
                            className="flex items-center gap-2 p-2 rounded border border-theme"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleParameter(norm.id, param.id, param.shortName || param.name)}
                              className="rounded border-theme"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-primary">
                                  {param.shortName || param.name}
                                </span>
                                {param.unit && (
                                  <span className="text-xs text-secondary">
                                    ({param.unit})
                                  </span>
                                )}
                                <div className="relative group">
                                  <Info size={12} className="text-secondary cursor-help" />
                                  <div className="absolute left-full ml-2 p-2 rounded bg-surface border border-theme invisible group-hover:visible min-w-[200px] z-10">
                                    <p className="text-xs text-primary">{param.name}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};