import React, { useState, useEffect } from 'react';
import { Theme } from '../../../../types/theme';
import { Language, useTranslation } from '../../../../types/language';
import { Parameter } from '../../../../types/parameters';
import { supabase } from '../../../../lib/supabase';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ParameterFilterProps {
  currentTheme: Theme;
  currentLanguage: Language;
  parameters: Parameter[];
  onParametersChange: (parameters: Parameter[]) => void;
}

const ParameterFilter: React.FC<ParameterFilterProps> = ({
  currentTheme,
  currentLanguage,
  parameters,
  onParametersChange
}) => {
  const [selectedNorm, setSelectedNorm] = useState<string | null>(null);
  const [norms, setNorms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslation(currentLanguage);

  useEffect(() => {
    loadNorms();
  }, []);

  const loadNorms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('norms')
        .select(`
          *,
          parameters:norm_parameters (
            parameter_id
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setNorms(data || []);
    } catch (err) {
      console.error('Error loading norms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNormChange = (normId: string) => {
    setSelectedNorm(normId === selectedNorm ? null : normId);
    
    if (normId === selectedNorm) {
      // Show all parameters when deselecting
      onParametersChange(parameters);
    } else {
      // Filter parameters based on selected norm
      const norm = norms.find(n => n.id === normId);
      if (norm) {
        const normParameterIds = norm.parameters.map((p: any) => p.parameter_id);
        const filteredParameters = parameters.filter(p => normParameterIds.includes(p.id));
        onParametersChange(filteredParameters);
      }
    }
  };

  return (
    <div className="mb-4 flex items-center gap-4">
      <div className="flex items-center gap-2 text-primary">
        <Filter size={16} />
        <span>{t("datapoint.filter_by_norm")}</span>
      </div>
      <div className="flex gap-2">
        {norms.map(norm => (
          <Button
            key={norm.id}
            onClick={() => handleNormChange(norm.id)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              selectedNorm === norm.id 
                ? 'bg-accent-primary text-primary' 
                : 'text-primary-foreground hover:bg-theme'
            }`}
          >
            {norm.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ParameterFilter;