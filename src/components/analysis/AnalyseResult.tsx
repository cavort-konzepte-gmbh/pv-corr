import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { FileText, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { Datapoint, Project, Zone } from '../../types/projects';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AnalyseResultProps {
  currentTheme: Theme;
  currentLanguage: Language;
  selectedDatapoints: Datapoint[];
  selectedNorm: any;
  project: Project;
  zone: Zone;
}

const AnalyseResult: React.FC<AnalyseResultProps> = ({
  currentTheme,
  currentLanguage,
  selectedDatapoints,
  selectedNorm,
  project,
  zone
}) => {
  const t = useTranslation(currentLanguage);
  const [expandedDatapoints, setExpandedDatapoints] = useState<Set<string>>(new Set());
  const [parameters, setParameters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parameterMap, setParameterMap] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadParameters = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('parameters')
          .select(`
            id,
            name,
            short_name,
            unit,
            rating_logic_code
          `)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setParameters(data || []);
        
        // Create parameter map for easier lookup
        const map = data.reduce((acc: Record<string, any>, param: any) => {
          acc[param.id] = param;
          return acc;
        }, {});
        setParameterMap(map);

      } catch (err) {
        console.error('Error loading parameters:', err);
        setError('Failed to load parameters');
      } finally {
        setLoading(false);
      }
    };

    loadParameters();
  }, []);

  const toggleDatapoint = (id: string) => {
    setExpandedDatapoints(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Calculate results for each datapoint
  const results = selectedDatapoints.map(datapoint => {
    // Calculate ratings for each parameter
    const parameterRatings = Object.entries(datapoint.values).reduce((acc, [paramId, value]) => {      
      const parameter = parameterMap[paramId];
      if (!parameter) return acc;

      // Execute rating logic code if available
      let rating = 0;
      if (parameter.rating_logic_code) {
        try {
          // Create a function from the rating logic code
          const calculateRating = new Function('value', parameter.rating_logic_code);
          rating = calculateRating(value);
        } catch (err) {
          console.error(`Error calculating rating for parameter ${parameter.short_name}:`, err);
        }
      }

      const paramName = parameter.short_name || parameter.name;      
      acc[paramName] = {
        value,
        rating,
        unit: parameter.unit
      };
      
      return acc;
    }, {} as Record<string, { value: string; rating: number; unit?: string }>);

    // Calculate B0 (sum of Z1-Z10 ratings)
    const b0 = Object.entries(parameterRatings)
      .filter(([code]) => /^Z[1-9]|10$/i.test(code))
      .reduce((sum, [_, { rating }]) => sum + rating, 0);

    // Calculate B1 (B0 + sum of Z11-Z15 ratings)
    const b1 = b0 + Object.entries(parameterRatings)
      .filter(([code]) => /^Z1[1-5]$/i.test(code))
      .reduce((sum, [_, { rating }]) => sum + rating, 0);

    // Classify results
    const classification = b0 >= 0 ? { class: 'Ia', stress: 'Sehr niedrig' } :
                         b0 >= -4 ? { class: 'Ib', stress: 'Niedrig' } :
                         b0 >= -10 ? { class: 'II', stress: 'Mittel' } :
                         { class: 'III', stress: 'Hoch' };

    return {
      datapoint,
      parameterRatings,
      b0,
      b1,
      classification
    };
  });

  if (loading) {
    return (
      <div className="text-center p-4 text-secondary">
        {t("analysis.loading")}
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
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-primary mb-4">
        {t("analysis.results")}
      </h3>

      <div className="space-y-4">
        {results.map(({ datapoint, parameterRatings, b0, b1, classification }) => (
          <div 
            key={datapoint.id}
            className="p-4 rounded-lg border border-theme bg-surface"
          >
            <div 
              className="flex items-center justify-between mb-2 cursor-pointer"
              onClick={() => toggleDatapoint(datapoint.id)}
            >
              <div className="font-medium text-primary">
                {datapoint.name}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-secondary">
                  {new Date(datapoint.timestamp).toLocaleString()}
                </div>
                {expandedDatapoints.has(datapoint.id) ? (
                  <ChevronDown size={16} className="text-secondary" />
                ) : (
                  <ChevronRight size={16} className="text-secondary" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm px-3 py-1 rounded bg-opacity-20 text-secondary bg-border">
                  B0: {b0} ({classification.class} - {classification.stress})
                </div>
                <div className="text-sm px-3 py-1 rounded bg-opacity-20 text-secondary bg-border">
                  B1: {b1}
                </div>
              </div>

              {expandedDatapoints.has(datapoint.id) && (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-secondary">Parameter</th>
                      <th className="text-left p-2 text-secondary">Value</th>
                      <th className="text-left p-2 text-secondary">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(parameterRatings).map(([code, { value, rating, unit }]) => (
                      <tr key={code} className="border-t border-theme">
                        <td className="p-2 text-primary">{code.toUpperCase()}</td>
                        <td className="p-2 text-primary">
                          {value} {unit && <span className="text-secondary">({unit})</span>}
                        </td>
                        <td className="p-2 text-primary">{rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={() => {
            // Navigate to output with preview params
            navigate(`/output?preview=true&projectId=${project.id}&zoneId=${zone.id}&normId=${selectedNorm.id}`);
          }}
          className="px-6 py-3 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
        >
          <FileText size={16} />
          {t("analysis.generate_report")} ({selectedDatapoints.length} {t("datapoints")})
        </button>
      </div>
    </div>
  );
};

export default AnalyseResult;