import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { Project, Zone } from "../../types/projects";
import { FileText, Save, Download, FileCheck } from "lucide-react";
import AnalysisReport from "./AnalysisReport";
import { useAuth } from "../auth/AuthProvider";
import { generateHiddenId } from "../../utils/generateHiddenId";
import AnalyseData from "./AnalyseData";
import AnalyseNorm from "./AnalyseNorm";
import AnalyseResult from "./AnalyseResult";
import { createReport } from "../../services/reports";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { supabase } from "../../lib/supabase";

interface AnalysisPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  projects: Project[];
  selectedProjectId?: string;
  selectedFieldId?: string;
  selectedZoneId?: string;
  onBack: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  currentTheme,
  currentLanguage,
  projects,
  selectedProjectId,
  selectedFieldId,
  selectedZoneId,
  onBack,
}) => {
  const [selectedNormId, setSelectedNormId] = useState<string | null>(null);
  const [selectedDatapoints, setSelectedDatapoints] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [selectedNorm, setSelectedNorm] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [parameters, setParameters] = useState<any[]>([]);
  const [navigating, setNavigating] = useState(false);
  const t = useTranslation(currentLanguage);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadNorm = async () => {
      if (!selectedNormId) {
        setSelectedNorm(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("norms")
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
          .eq("id", selectedNormId)
          .single();

        if (error) throw error;
        setSelectedNorm(data);
      } catch (err) {
        console.error("Error loading norm:", err);
      }
    };

    loadNorm();
  }, [selectedNormId]);

  const handleSaveAnalysis = async () => {
    if (!selectedProject || !selectedZone || !selectedNorm || selectedDatapoints.length === 0) {
      console.error("Missing required data for analysis");
      return;
    }

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: output, error: outputError } = await supabase
        .from("analysis_outputs")
        .insert({
          hidden_id: generateHiddenId(),
          project_id: selectedProject.id,
          zone_id: selectedZone.id,
          norm_id: selectedNorm.id,
          analyst_id: user.id,
        })
        .select()
        .single();

      if (outputError) throw outputError;

      const selectedDps = selectedZone.datapoints.filter((dp) => selectedDatapoints.includes(dp.id));
      const totalRating = selectedDps.reduce((sum, dp) => sum + Object.values(dp.ratings).reduce((a, b) => a + b, 0), 0);

      const { error: versionError } = await supabase.from("analysis_versions").insert({
        output_id: output.id,
        version_number: 1,
        parameters: selectedDps.map((dp) => ({
          id: dp.id,
          values: dp.values,
          ratings: dp.ratings,
        })),
        ratings: selectedDps.reduce((acc, dp) => ({ ...acc, [dp.id]: dp.ratings }), {}),
        total_rating: totalRating,
        classification: totalRating > 0 ? "Good" : "Poor",
        recommendations: "Based on the analysis results...",
        created_by: user.id,
      });

      if (versionError) throw versionError;

      setShowReport(true);
    } catch (err) {
      console.error("Error saving analysis:", err);
      // TODO: Show error to user
    }
  };

  const handleCreateReport = async () => {
    if (!selectedProject || !selectedZone || !selectedNorm || selectedDatapoints.length === 0) {
      setSaveError("Please select datapoints and a norm before creating a report");
      return;
    }

    try {
      setIsSaving(true);
      setNavigating(true);
      setSaveError(null);

      // Get selected datapoints
      const selectedDps = selectedZone.datapoints.filter((dp) => selectedDatapoints.includes(dp.id));
      
      // Calculate total rating
      const totalRating = selectedDps.reduce((sum, dp) => {
        return sum + Object.values(dp.ratings || {}).reduce((a, b) => a + b, 0);
      }, 0);
      
      // Get the datapoint IDs to include in the URL
      const datapointIds = selectedDatapoints.join(',');

      // Determine classification based on total rating
      const classification = 
        totalRating >= 0 ? "Ia" :
        totalRating >= -4 ? "Ib" :
        totalRating >= -10 ? "II" : "III";

      // Create report data
      const reportData = {
        projectId: selectedProject.id,
        zoneId: selectedZone.id,
        standardId: selectedNorm.id,
        content: {
          projectName: selectedProject.name,
          zoneName: selectedZone.name,
          normName: selectedNorm.name,
          timestamp: new Date().toISOString(),
        },
        parameters: selectedDps.map(dp => ({
          id: dp.id,
          values: dp.values,
          ratings: dp.ratings,
        })),
        ratings: selectedDps.reduce((acc, dp) => ({ ...acc, [dp.id]: dp.ratings }), {}),
        totalRating,
        classification,
        recommendations: totalRating >= 0 
          ? "No special measures required. Standard corrosion protection is sufficient."
          : totalRating >= -10
            ? "Moderate corrosion protection measures recommended."
            : "Enhanced corrosion protection measures required.",
      };

      // Create the report
      const { report } = await createReport(reportData);

      // Navigate to output view with the report ID and datapoint IDs
      window.location.href = `/?view=output&reportId=${report.id}&datapointIds=${datapointIds}`;
    } catch (err) {
      console.error("Error creating report:", err);
      setSaveError("Failed to create report: " + (err instanceof Error ? err.message : String(err)));
      setNavigating(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Get selected project and zone from navigation state
  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null;
  const selectedField = selectedProject && selectedFieldId ? selectedProject.fields.find((f) => f.id === selectedFieldId) : null;
  const selectedZone = selectedField && selectedZoneId ? selectedField.zones.find((z) => z.id === selectedZoneId) : null;

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        const { data, error } = await supabase.from("analysis_parameters").select("*").order("created_at", { ascending: true });

        if (error) throw error;
        setParameters(data || []);
      } catch (err) {
        console.error("Error loading analysis data:", err);
      }
    };

    loadAnalysisData();
  }, []);

  const toggleDatapoint = (datapointId: string) => {
    setSelectedDatapoints((prev) => (prev.includes(datapointId) ? prev.filter((id) => id !== datapointId) : [...prev, datapointId]));
  };

  if (showReport && selectedProject && selectedZone && selectedNorm) {
    return (
      <AnalysisReport
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        project={selectedProject}
        zone={selectedZone}
        norm={selectedNorm}
        analyst={
          user
            ? {
                name: user.user_metadata?.display_name || user.email || "",
                title: user.user_metadata?.title || "",
                email: user.email || "",
              }
            : undefined
        }
        onBack={() => setShowReport(false)}
      />
    );
  }

  if (!selectedZone) {
    return <div className="p-6 text-center text-secondary">{t("datapoint.please_select_zone")}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">
        {t("analysis.title")}
        {selectedProject && (
          <span className="text-sm El text-secondary-foreground ml-2">
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
          selectedNormId={selectedNormId}
          onSelectNorm={setSelectedNormId}
        />

        {/* Analysis Result */}
        {selectedDatapoints.length > 0 && selectedNormId && (
          <AnalyseResult
            key={`result-${selectedDatapoints.join("-")}-${selectedNormId}`}
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            selectedDatapoints={selectedZone.datapoints.filter((dp) => selectedDatapoints.includes(dp.id))}
            selectedNorm={selectedNorm}
            project={selectedProject}
            zone={selectedZone}
          />
        )}

        {/* Create Report Button */}
        {selectedDatapoints.length > 0 && selectedNormId && (
          <div className="flex justify-between items-center mt-8 border-t pt-6 border-input bg-card p-4 rounded-lg">
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">{t("analysis.report_options")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a report from your analysis to save and share your findings.
              </p>
              {saveError && (
                <div className="p-3 mb-4 text-sm rounded bg-destructive/10 text-destructive">
                  {saveError}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (navigating) return;
                   
                  setNavigating(true);
                  
                  // Get the datapoint IDs to include in the URL
                  const datapointIds = selectedDatapoints.join(',');
                  
                  // Use window.location for a full page navigation
                  window.location.href = `/?view=output&preview=true&projectId=${selectedProject?.id}&zoneId=${selectedZone?.id}&normId=${selectedNorm?.id}&datapointIds=${datapointIds}`;
                }}
                title="Preview a report from the selected datapoints"
                disabled={navigating || isSaving || selectedDatapoints.length === 0 || !selectedNormId}
                variant="outline"
                className="px-6 py-3 rounded text-sm flex items-center gap-2"
              >
                <FileText size={16} />
                {t("analysis.preview_report")}
              </Button>
              <Button
                onClick={handleCreateReport}
                disabled={isSaving || selectedDatapoints.length === 0 || !selectedNormId}
                className="px-6 py-3 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
              >
                <FileCheck size={16} />
                {isSaving ? t("analysis.creating_report") : t("analysis.create_report")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;