import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { FileText, Info, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Datapoint } from '../../types/projects';
import { Standard } from '../../types/standards';
import { supabase } from '../../lib/supabase';

interface AnalyseResultProps {
  currentTheme: Theme;
  currentLanguage: Language;
  selectedDatapoints: Datapoint[];
  selectedStandard: Standard;
  onGenerateReport: () => void;
}

const AnalyseResult: React.FC<AnalyseResultProps> = ({
  currentTheme,
  currentLanguage,
  selectedDatapoints,
  selectedStandard,
  onGenerateReport
}) => {
  const t = useTranslation(currentLanguage);
  const [expandedDatapoints, setExpandedDatapoints] = useState<Set<string>>(new Set());
  const [parameters, setParameters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [norm, setNorm] = useState<any>(null);

  useEffect(() => {
    const loadParameters = async () => {
      try {
        setLoading(true);
        const { data: normData, error: normError } = await supabase
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
                rating_logic_code,
                order_number
              )
            )
          `)
          .eq('id', selectedStandard.id)
          .single();

        if (normError) throw normError;
        
        // Extract parameters from norm data
        const params = normData.norm_parameters
          .map(np => np.parameter)
          .sort((a, b) => {
            const aOrder = typeof a.order_number === 'number' ? a.order_number : parseFloat(a.order_number as string) || 0;
            const bOrder = typeof b.order_number === 'number' ? b.order_number : parseFloat(b.order_number as string) || 0;
            return aOrder - bOrder;
          });

        setParameters(params);
        setNorm(normData);
      } catch (err) {
        console.error('Error loading parameters:', err);
        setError('Failed to load analysis data');
      } finally {
        setLoading(false);
      }
    };

    loadParameters();
  }, [selectedStandard.id]);

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

  const calculateOutputs = (datapoint: Datapoint) => {
    if (!norm?.output_config) return {};

    const outputs: Record<string, number> = {};
    const values = datapoint.ratings;

    norm.output_config.forEach((output: any) => {
      try {
        // Create a function from the formula with error handling
        const calcFunc = new Function('values', `
          try {
            return ${output.formula};
          } catch (err) {
            console.error('Error in formula:', err);
            return 0;
          }
        `);
        const result = calcFunc(values);
        outputs[output.name] = typeof result === 'number' ? result : 0;
      } catch (err) {
        console.error(`Error calculating ${output.name}:`, err);
        outputs[output.name] = 0;
      }
    });

    return outputs;
  };

  // Calculate results for each datapoint
  const results = selectedDatapoints.map(datapoint => {
    const outputs = calculateOutputs(datapoint);

    // Classify results
    const b0 = outputs.B0 || 0;
    const classification = b0 >= 0 ? { class: 'Ia', stress: 'Very low' } :
                         b0 >= -4 ? { class: 'Ib', stress: 'Low' } :
                         b0 >= -10 ? { class: 'II', stress: 'Medium' } :
                         { class: 'III', stress: 'High' };

    return {
      datapoint,
      outputs,
      classification
    };
  });

  if (loading) {
    return (
      <div className="text-center p-4 text-secondary">
        <div className="animate-pulse">Loading analysis data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded bg-surface border border-theme">
        <div className="flex items-center gap-2 text-secondary">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!norm?.output_config?.length) {
    return (
      <div className="p-4 rounded bg-surface border border-theme text-primary">
        <div className="flex items-center gap-2 text-secondary">
          <AlertCircle size={16} />
          <span>This standard has no output configuration. Please configure outputs in the admin panel first.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-primary mb-4">
        {t("analysis.results")}
      </h3>

      <div className="space-y-4">
        {results.map(({ datapoint, outputs, classification }) => (
          <div 
            key={datapoint.id}
            className="p-4 rounded-lg border border-theme bg-surface"
          >
            <div 
              className="flex items-center justify-between mb-2 cursor-pointer"
              onClick={() => toggleDatapoint(datapoint.id)}
            >
              <div className="font-medium text-primary">
                {datapoint.name || datapoint.sequentialId}
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
                {norm.output_config.map((output: any) => (
                  <div key={output.id} className="text-sm px-3 py-1 rounded bg-opacity-20 text-secondary bg-border">
                    {output.name}: {outputs[output.name]?.toFixed(2)}
                    {output.name === 'B0' && (
                      <span className="ml-2">
                        ({classification.class} - {classification.stress})
                      </span>
                    )}
                  </div>
                ))}
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
                    {Object.entries(datapoint.values).map(([paramId, value]) => {
                      const parameter = parameters.find(p => p.id === paramId);
                      if (!parameter) return null;
                      const rating = datapoint.ratings[paramId];
                      return (
                      <tr key={paramId} className="border-t border-theme">
                        <td className="p-2 text-primary">{parameter.shortName || parameter.name}</td>
                        <td className="p-2 text-primary">
                          {value} {parameter.unit && <span className="text-secondary">({parameter.unit})</span>}
                        </td>
                        <td className="p-2 text-primary">{rating}</td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onGenerateReport}
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