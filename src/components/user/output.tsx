import React, { useState } from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { Project } from "../../types/projects";
import { FileText, Download, Eye, History, Info, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase"; 
import OutputView from "../output/OutputView";
import { Button } from "../ui/button";
import { fetchReports } from "../../services/reports";
import { Card, CardContent } from "../ui/card";

interface OutputProps {
  currentTheme: Theme;
  currentLanguage: Language;
  projects: Project[]; 
  reports: any[];
}

interface Report {
  id: string;
  hiddenId: string;
  projectId: string;
  zoneId: string;
  normId: string;
  createdAt: string;
  versions: {
    id: string;
    versionNumber: number;
    totalRating: number; 
    classification: string;
    createdAt: string;
  }[];
}

const Output: React.FC<OutputProps> = ({ currentTheme, currentLanguage, projects, reports: initialReports }) => {
  const [reports, setReports] = useState<Report[]>(initialReports || []);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [selectedNorm, setSelectedNorm] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingReports, setLoadingReports] = useState(true); 
  const t = useTranslation(currentLanguage);
  const [error, setError] = useState<string | null>(null);

  // Load reports when component mounts
  useEffect(() => {
    const loadReports = async () => {
      if (!initialReports || initialReports.length === 0) {
        try {
          setLoadingReports(true);
          const fetchedReports = await fetchReports();
          setReports(fetchedReports || []);
        } catch (err) {
          console.error("Error loading reports:", err);
          setError("Failed to load reports");
        } finally {
          setLoadingReports(false);
        }
      } else {
        setReports(initialReports);
        setLoadingReports(false);
      }
    };
    
    loadReports();
  }, [initialReports]);

  useEffect(() => {
    const loadPreview = async () => {
      const params = new URLSearchParams(location.search);
      const preview = params.get("preview") === "true";
      const projectId = params.get("projectId") || "";
      const zoneId = params.get("zoneId") || "";
      const normId = params.get("normId") || "";

      if (preview && projectId && zoneId && normId) {
        console.log("Loading preview with params:", { projectId, zoneId, normId });
        try {
          // Load norm data
          const { data: norm, error: normError } = await supabase.from("norms").select("*").eq("id", normId).single();

          if (normError) {
            console.error("Error loading norm:", normError);
            throw normError;
          }
          
          setSelectedNorm(norm);
          console.log("Loaded norm:", norm);

          // Get user info from auth
          const {
            data: { user },
          } = await supabase.auth.getUser();

          // Find project and zone in the projects array
          let foundProject = null;
          let foundZone = null;
          
          for (const p of projects) {
            if (p.id === projectId) {
              foundProject = p;
              for (const field of p.fields || []) {
                for (const z of field.zones || []) {
                  if (z.id === zoneId) {
                    foundZone = z;
                    break;
                  }
                }
                if (foundZone) break;
              }
            }
            if (foundProject && foundZone) break;
          }
          
          console.log("Found project and zone:", { foundProject, foundZone });

          setSelectedVersion({
            projectId,
            zoneId,
            normId,
            project: foundProject,
            zone: foundZone,
            analyst: {
              name: user?.user_metadata?.display_name || user?.email || "",
              title: user?.user_metadata?.title || "",
              email: user?.email || "",
            },
          });
          setShowPreview(true);
        } catch (err) {
          console.error("Error loading preview data:", err);
          setError(`Failed to load preview data: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    };

    loadPreview();
  }, [location.search, projects]);

  const getProjectName = (projectId: string): string => {
    return projects.find((p) => p.id === projectId)?.name || "Unknown Project";
  };

  const getZoneName = (projectId: string, zoneId: string): string => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return "Unknown Zone";

    for (const field of project.fields) {
      const zone = field.zones.find((z) => z.id === zoneId);
      if (zone) return zone.name;
    }
    return "Unknown Zone";
  };

  const getNormName = (normId: string): string => {
    return normId || t("analysis.standard_analysis");
  };

  // Check if we should show the report view
  const shouldShowReport = () => {
    const hasReportId = new URLSearchParams(location.search).has('reportId');
    
    if (showPreview && selectedVersion) return true;
    
    // Check URL parameters for direct report viewing
    const params = new URLSearchParams(location.search);
    const isPreview = params.get("preview") === "true";
    const result = hasReportId || (isPreview && params.get("projectId") && params.get("zoneId") && params.get("normId"));
    // console.log("shouldShowReport:", result, { hasReportId, isPreview, params: Object.fromEntries(params) });
    return result;
  };

  const handleShowPreview = (report: Report, version: any) => {
    console.log("Showing preview for report:", report.id, "version:", version);
    setSelectedVersion(version);
    setSelectedVersion({
      ...version,
      projectId: report.projectId,
      zoneId: report.zoneId,
      normId: report.normId
    });
    setShowPreview(true);
  };

  if (shouldShowReport()) {
    // Find the project and zone based on the selected version or URL parameters
    const projectId = selectedVersion?.projectId || new URLSearchParams(location.search).get("projectId");
    const zoneId = selectedVersion?.zoneId || new URLSearchParams(location.search).get("zoneId");
    const normId = selectedVersion?.normId || new URLSearchParams(location.search).get("normId") || "";

    // console.log("Rendering OutputView with:", { projectId, zoneId, normId, selectedVersion });
    
    // Use the project and zone from selectedVersion if available, otherwise find them in projects
    const project = selectedVersion?.project || projects.find(p => p.id === projectId);
    let zone = selectedVersion?.zone;

    // If we don't have the zone from selectedVersion, find it in the projects
    if (!zone && project) {
      // Search through all fields and their zones to find the matching zone
      for (const field of project.fields || []) {
        const matchingZone = field.zones?.find(z => z.id === zoneId);
        if (matchingZone) {
          zone = matchingZone;
          break;
        }
      }
    }

    console.log("Found project and zone for OutputView:", { project, zone, normId });

    return (
      <OutputView 
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        project={project}
        zone={zone}
        normId={normId || ""}
        onBack={() => {
          setShowPreview(false);
          setSelectedVersion(null);
          setSelectedNorm(null);
          
          // If we came from a direct URL, navigate back to reports list
          const params = new URLSearchParams(location.search);
          if (params.has("reportId") || params.get("preview") === "true") {
            navigate("?view=reports");
          }
        }}
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">{t("reports.title")}</h2>

      <div className="space-y-4">
        {error && (
          <div className="p-4 mb-4 rounded-md text-destructive border border-destructive bg-destructive/10">
            {error}
          </div>
        )}
        
        {loadingReports ? (
          <Card className="border border-input">
            <CardContent className="p-6 text-center">
              <Loader2 className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50 animate-spin" /> 
              <h3 className="text-lg font-medium mb-2">{t("output.loading")}</h3>
            </CardContent>
          </Card>
        ) : reports.length === 0 && (
          <Card className="border border-input">
            <CardContent className="p-6 text-center">
              <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">{t("output.no_reports")}</h3>
              <div className="max-w-md mx-auto">
                <p className="mb-4">{t("output.no_reports_description")}</p>
                <div className="text-left space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5"><Info size={14} /></div>
                    <p>{t("output.create_report_instruction_1")}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5"><Info size={14} /></div>
                    <p>{t("output.create_report_instruction_2")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Output;