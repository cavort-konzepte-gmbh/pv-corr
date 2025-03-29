import React from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';

interface AnalyseNormProps {
  currentTheme: Theme;
  currentLanguage: Language;
  selectedNormId: string | null;
  onSelectNorm: (id: string) => void;
}

const AnalyseNorm: React.FC<AnalyseNormProps> = ({ currentTheme, currentLanguage, selectedNormId, onSelectNorm }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [norms, setNorms] = useState<any[]>([]);
  const t = useTranslation(currentLanguage);

  useEffect(() => {
    const loadNorms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('norms')
          .select(
            `
            *,
            parameters:norm_parameters (
              parameter_id,
              parameter_code,
              rating_ranges
            )
          `,
          )
          .order('created_at', { ascending: true });

        if (error) throw error;
        setNorms(data || []);
      } catch (err) {
        console.error('Error loading norms:', err);
        setError('Failed to load norms');
      } finally {
        setLoading(false);
      }
    };

    loadNorms();
  }, []);

  if (loading) {
    return <div className="text-center p-4 text-secondary">{t('analysis.loading')}</div>;
  }

  if (error) {
    return <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium  mb-4">{t('analysis.select_norm')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {norms.map((norm) => (
          <Button
            key={norm.id}
            onClick={() => onSelectNorm(norm.id)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              selectedNormId === norm.id ? ' text-primary-foreground hover:bg-theme' : 'bg-accent-primary text-primary '
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm ">{norm.name}</div>
              </div>
              {selectedNormId === norm.id && <Check size={12} className="text-accent-primary" />}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AnalyseNorm;
