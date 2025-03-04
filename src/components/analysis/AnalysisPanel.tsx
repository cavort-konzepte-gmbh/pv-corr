import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Project, Zone } from '../../types/projects';
import { Standard } from '../../types/standards';
import { FileText } from 'lucide-react';
import AnalysisReport from './AnalysisReport';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { generateHiddenId } from '../../utils/generateHiddenId';
import AnalyseData from './AnalyseData';
import AnalyseNorm from './AnalyseNorm';
import AnalyseResult from './AnalyseResult';

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
  const [selectedNorm, setSelectedNorm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation(currentLanguage);
  const { user } = useAuth();

  useEffect(() => {
    const loadNorm = async () => {
      if (!selectedStandardId) {
        setSelectedNorm(null);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('norms')
          .select(`
            *,
            parameters:norm_parameters (
              parameter_id,
              parameter_code,
              rating_ranges
            )
          `)
          .eq('id', selectedStandardId)
          .single();

        if (error) throw error;
        setSelectedNorm(data);
      } catch (err) {
        console.error('Error loading norm:', err);
        setError('Failed to load norm');
      } finally {
        setLoading(false);
      }
    };

    loadNorm();
  }, [selectedStandardId]);

  const handleSaveAnalysis = async () => {
    if (!selectedProject || !selectedZone || !selectedNorm || selectedDatapoints.length === 0) {
      setError('Missing required data for analysis');
      return;
    }

    try {
      const { data: output, error: outputError } = await supabase
        .from('analysis_outputs')
        .insert({
          hidden_id: generateHiddenId(),
          project_id: selectedProject.id,
          zone_id: selectedZone.id,
          standard_id: selectedNorm.id,
          analyst_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (outputError) throw outputError;

      const selectedDps = selectedZone.datapoints.filter(dp => selectedDatapoints.includes(dp.id));
      const totalRating = selectedDps.reduce((sum, dp) => 
        sum + Object.values(dp.ratings).reduce((a, b) => a + b, 0), 0);

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
        standard={selectedNorm}
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
        {/* Analysis Table */}
        <AnalyseData
          currentTheme={currentTheme}
          currentLanguage={currentLanguage}
          datapoints={selectedZone.datapoints}
          selectedDatapoints={selectedDatapoints}
          onToggleDatapoint={toggleDatapoint}
        />

        {/* Norm Selection */}
        <AnalyseNorm
          currentTheme={currentTheme}
          currentLanguage={currentLanguage}
          standards={standards}
          selectedStandardId={selectedStandardId}
          onSelectStandard={setSelectedStandardId}
        />

        {/* Analysis Result */}
        {selectedDatapoints.length > 0 && selectedStandardId && (
          <AnalyseResult
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            selectedDatapoints={selectedZone.datapoints.filter(dp => selectedDatapoints.includes(dp.id))}
            selectedStandard={standards.find(s => s.id === selectedStandardId)!}
            onGenerateReport={handleSaveAnalysis}
          />
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