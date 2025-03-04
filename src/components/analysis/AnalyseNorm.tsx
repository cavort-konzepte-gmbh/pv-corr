import React from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Standard } from '../../types/standards'; 
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Parameter } from '../../types/parameters';

interface AnalyseNormProps {
  currentTheme: Theme;
  currentLanguage: Language;
  standards: Standard[];
  selectedStandardId: string | null;
  onSelectStandard: (id: string) => void;
}

interface NormWithParameters {
  id: string;
  name: string;
  description?: string;
  version?: string;
  output_config: any[];
  norm_parameters: {
    parameter_id: string;
    parameter: Parameter;
  }[];
}
const AnalyseNorm: React.FC<AnalyseNormProps> = ({
  currentTheme,
  currentLanguage,
  standards,
  selectedStandardId,
  onSelectStandard
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [norms, setNorms] = useState<NormWithParameters[]>([]);
  const t = useTranslation(currentLanguage);

  useEffect(() => {
    const loadNorms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('norms')
          .select(`
            *,
            output_config,
            norm_parameters!inner (
              parameter_id,
              parameter:parameters!inner (
                id,
                name,
                short_name,
                unit,
                rating_logic_code
              )
            )
          `)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setNorms(data || []);
      } catch (err) {
        console.error('Error loading norms:', err);
        setError('Failed to load standards');
      } finally {
        setLoading(false);
      }
    };

    loadNorms();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-4 text-secondary">
        {t("analysis.loading_norms")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-primary mb-4">
        {t("analysis.select_standard")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {norms.map(norm => (
          <button
            key={norm.id}
            onClick={() => onSelectStandard(norm.id)}
            className={`p-2 rounded border transition-all hover:translate-x-1 text-left ${
              selectedStandardId === norm.id 
              ? 'border-accent-primary bg-opacity-10'
              : 'border-theme'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-primary">{norm.name}</div>
              </div>
              {selectedStandardId === norm.id && (
                <Check size={12} className="text-accent-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalyseNorm;