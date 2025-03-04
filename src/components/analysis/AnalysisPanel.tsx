import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Project, Zone } from '../../types/projects';
import { Standard, STANDARDS } from '../../types/standards';
import { FileText, Database, Check } from 'lucide-react';
import AnalysisReport from './AnalysisReport';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { generateHiddenId } from '../../utils/generateHiddenId';
import { useAppNavigation } from '../../hooks/useAppNavigation';

interface AnalysisPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  projects: Project[];
  standards: Standard[];
  selectedProjectId?: string;
  selectedFieldId?: string;
  selectedZoneId?: string;
  onBack: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  currentTheme,
  currentLanguage,
  projects,
  standards,
  selectedProjectId,
  selectedFieldId,
  selectedZoneId,
  onBack
}) => {
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [selectedDatapoints, setSelectedDatapoints] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [parameters, setParameters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation(currentLanguage);
  const { user } = useAuth();

  const handleSaveAnalysis = async () => {
    if (!selectedProject || !selectedZone || !selectedStandard || selectedDatapoints.length === 0) {
      setError('Missing required data for analysis');
      return;
    }

    try {
      // Create analysis output
      const { data: output, error: outputError } = await supabase
        .from('analysis_outputs')
        .insert({
          hidden_id: generateHiddenId(),
          project_id: selectedProject.id,
          zone_id: selectedZone.id,
          standard_id: selectedStandard.id,
          analyst_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (outputError) throw outputError;

      // Calculate total rating and prepare parameters
      const selectedDps = selectedZone.datapoints.filter(dp => selectedDatapoints.includes(dp.id));
      const totalRating = selectedDps.reduce((sum, dp) => 
        sum + Object.values(dp.ratings).reduce((a, b) => a + b, 0), 0);

      // Create first version
      const { error: versionError } = await supabase
        .from('analysis_versions')
        .insert({
          output_id: output.id,
          version_number: 1,
          parameters: selectedDps.map(dp => ({
            id: dp.id,
            values: dp.values,
            ratings: dp.ratings
          })),
          ratings: selectedDps.reduce((acc, dp) => ({ ...acc, [dp.id]: dp.ratings }), {}),
          total_rating: totalRating,
          classification: totalRating > 0 ? 'Good' : 'Poor',
          recommendations: 'Based on the analysis results...',
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (versionError) throw versionError;

      // Show report after saving
      setShowReport(true);
    } catch (err) {
      console.error('Error saving analysis:', err);
      setError('Failed to save analysis');
    }
  };

  // Get selected project and zone from navigation state
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
  const selectedField = selectedProject && selectedFieldId 
    ? selectedProject.fields.find(f => f.id === selectedFieldId)
    : null;
  const selectedZone = selectedField && selectedZoneId
    ? selectedField.zones.find(z => z.id === selectedZoneId)
    : null;

  const selectedStandard = standards.find(s => s.id === selectedStandardId);

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('analysis_parameters')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setParameters(data || []);
      } catch (err) {
        console.error('Error loading analysis data:', err);
        setError('Failed to load analysis data');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisData();
  }, []);

  const toggleDatapoint = (datapointId: string) => {
    setSelectedDatapoints(prev => 
      prev.includes(datapointId) 
        ? prev.filter(id => id !== datapointId)
        : [...prev, datapointId]
    );
  };

  if (showReport && selectedProject && selectedZone && selectedStandard) {
    return (
      <AnalysisReport
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        project={selectedProject}
        zone={selectedZone}
        standard={selectedStandard}
        analyst={user ? {
          name: user.user_metadata?.display_name || user.email || '',
          title: user.user_metadata?.title || '',
          email: user.email || ''
        } : undefined}
        onBack={() => setShowReport(false)}
      />
    );
  }

  if (!selectedZone) {
    return (
      <div className="p-6 text-center text-secondary">
        {t("analysis.select_zone_first")}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">
        {t("analysis.title")}
        {selectedProject && (
          <span className="text-sm text-secondary ml-2">
            {selectedProject.name} {selectedField && `→ ${selectedField.name}`} {selectedZone && `→ ${selectedZone.name}`}
          </span>
        )}
      </h2>

      <div className="space-y-6">
        {/* Datapoints Selection */}
        <div className="p-6 rounded-lg border border-theme bg-surface">
          <h3 className="text-lg font-medium text-primary mb-4">
            {t("analysis.select_datapoints")}
          </h3>
          {selectedZone.datapoints && selectedZone.datapoints.length > 0 ? (
            <div className="space-y-2">
              {selectedZone.datapoints.map(datapoint => (
                <button
                  key={datapoint.id}
                  onClick={() => toggleDatapoint(datapoint.id)}
                  className={`w-full p-4 rounded-lg border transition-all hover:translate-x-1 text-left ${
                    selectedDatapoints.includes(datapoint.id)
                      ? 'border-accent-primary bg-opacity-10'
                      : 'border-theme'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-primary">
                        {datapoint.name || datapoint.sequentialId}
                      </div>
                      <div className="text-sm text-secondary">
                        {new Date(datapoint.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database size={16} className="text-secondary" />
                      {selectedDatapoints.includes(datapoint.id) && (
                        <Check size={16} className="text-accent-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-secondary">
              {t("analysis.no_datapoints")}
            </div>
          )}
        </div>

        {/* Standard Selection */}
        {selectedDatapoints.length > 0 && (
          <div className="p-6 rounded-lg border border-theme bg-surface">
            <h3 className="text-lg font-medium text-primary mb-4">
              {t("analysis.select_standard")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {standards.map(standard => (
                <button
                  key={standard.id}
                  onClick={() => setSelectedStandardId(standard.id)}
                  className={`p-4 rounded-lg border transition-all hover:translate-x-1 text-left ${
                    selectedStandardId === standard.id 
                    ? 'border-accent-primary bg-opacity-10'
                    : 'border-theme'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-primary">{standard.name}</div>
                      {standard.description && (
                        <div className="text-sm text-secondary">
                          {standard.description}
                        </div>
                      )}
                    </div>
                    {selectedStandardId === standard.id && (
                      <Check size={16} className="text-accent-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDatapoints.length > 0 && selectedStandardId && (
          <div className="flex justify-end">
            <button
              onClick={handleSaveAnalysis}
              className="px-6 py-3 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
            >
              <FileText size={16} />
              {t("analysis.generate_report")} ({selectedDatapoints.length} {t("datapoints")})
            </button>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;