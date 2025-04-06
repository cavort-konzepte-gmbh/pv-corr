import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { Project, Zone } from "../../types/projects";
import { FileText, Download, Share, ChevronLeft, Calendar, User, Building2, MapPin, Check, X, Info, Loader2, Printer } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getCurrentVersion } from "../../services/versions";
import { Button } from "../ui/button"; 
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useLocation, useNavigate } from "react-router-dom";

interface OutputViewProps {
  currentTheme: Theme;
  currentLanguage: Language;
  project?: Project;
  zone?: Zone;
  normId?: string;
  onBack: () => void;
}

const OutputView: React.FC<OutputViewProps> = ({ currentTheme, currentLanguage, project, zone, normId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [datapoints, setDatapoints] = useState<any[]>([]);
  const [norm, setNorm] = useState<any>(null); 
  const [currentVersion, setCurrentVersion] = useState<string>("1.0.0");
  const [analyst, setAnalyst] = useState<{
    name: string;
    title?: string;
    email?: string;
  } | null>(null);
  const t = useTranslation(currentLanguage);
  const location = useLocation();
  const navigate = useNavigate();
  const [parameterDetails, setParameterDetails] = useState<Record<string, {name: string, unit: string}>>({});
  
  // Debug function to help trace data flow
  const debugLog = (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      // console.log(`[OutputView] ${message}`, data || '');
    }
  };

  // Load report data based on URL parameters
  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        debugLog("Loading report data with props:", { project, zone, normId });
        
        // Get parameters from URL
        const params = new URLSearchParams(location.search);
        const reportId = params.get("reportId");
        const versionNumber = params.get("version") || undefined;
        const preview = params.get("preview") === "true";
        const projectId = params.get("projectId") || project?.id; 
        const zoneId = params.get("zoneId") || zone?.id; 
        const normIdFromUrl = params.get("normId"); 
        const normIdToUse = normId || normIdFromUrl;

        debugLog("URL parameters:", { reportId, versionNumber, preview, projectId, zoneId, normIdToUse });
        
        if (reportId) {
          // Load specific report
          const { data: report, error: reportError } = await supabase
            .from("analysis_outputs")
            .select("*, versions:analysis_versions(*)")
            .eq("id", reportId)
            .single();
            
          if (reportError) throw reportError;
          
          // Get the specific version or latest
          let version;
          if (versionNumber) {
            version = report.versions?.find((v: any) => v.version_number?.toString() === versionNumber);
          } else {
            // Sort versions by version number descending and get the first one
            version = report.versions && report.versions.length > 0 
              ? [...report.versions].sort((a, b) => b.version_number - a.version_number)[0]
              : null;
          }
          
          if (!version) throw new Error("Version not found");
          
          // Load norm data
          const { data: normData, error: normError } = await supabase
            .from("norms")
            .select("*")
            .eq("id", report.norm_id)
            .single();
            
          if (normError) throw normError;
          
          setReportData({
            id: report.id,
            hidden_id: report.hidden_id,
            project_id: report.project_id,
            zone_id: report.zone_id,
            norm_id: report.norm_id,
            analyst_id: report.analyst_id,
            created_at: report.created_at,
            currentVersion: version,
          });
          setNorm(normData);
          debugLog("Loaded report data:", { report, version, normData });
          
          // Load project and zone data if needed
          if (!project || !zone) {
            const projectResponse = await supabase
              .from("projects").select("*").eq("id", report.project_id).single();
              
            const zoneResponse = await supabase
              .from("zones").select("*").eq("id", report.zone_id).single();
              
            if (!projectResponse.error && !zoneResponse.error) {
              // We would set project and zone here if they weren't passed as props
              // This is just for reference
            }
          }
        } else if ((project && zone && normIdToUse) || (preview === "true" && projectId && zoneId && normIdToUse)) {
          // Preview mode - construct data from current selection or URL parameters
          debugLog("Preview mode with normId:", normIdToUse);
          
          if (!normIdToUse) {
            debugLog("Missing norm ID");
            throw new Error("Norm ID is required");
          }
          
          const { data: normData, error: normError } = await supabase
            .from("norms")
            .select("*")
            .eq("id", normIdToUse)
            .single();
            
          if (normError) throw normError;
          
          setNorm(normData);
          debugLog("Loaded norm data:", normData);
          
          // If we have project and zone directly, use them
          let projectToUse = project;
          let zoneToUse = zone;
          let datapointsToUse: any[] = [];
          
          // If we don't have project or zone directly, try to fetch them
          if (!projectToUse && projectId) {
            projectToUse = await fetchProject(projectId);
          }
          
          if (!zoneToUse && zoneId) {
            zoneToUse = await fetchZone(zoneId);
          }
          
          debugLog("Using project and zone:", { projectToUse, zoneToUse });
          
          if (!projectToUse || !zoneToUse) {
            debugLog("Missing project or zone");
            throw new Error("Project and Zone are required");
          }
          
          // If we don't have the zone's datapoints, fetch them
          if (zoneToUse && (!zoneToUse.datapoints || zoneToUse.datapoints.length === 0)) {
            debugLog("Fetching datapoints for zone:", zoneToUse?.id);
            const { data: datapointsData, error: datapointsError } = await supabase
              .from("datapoints")
              .select("id, hidden_id, name, type, values, ratings, timestamp")
              .eq("zone_id", zoneToUse?.id);
              
            if (datapointsError) {
              debugLog("Error fetching datapoints:", datapointsError);
              throw datapointsError;
            }
            
            datapointsToUse = datapointsData || [];
            debugLog("Fetched datapoints:", datapointsToUse);
            setDatapoints(datapointsToUse);
          } else {
            datapointsToUse = zoneToUse?.datapoints || [];
            debugLog("Using existing datapoints from zone:", datapointsToUse);
            setDatapoints(datapointsToUse);
          }
          
          // Create a preview report
          debugLog("Creating preview report with datapoints:", datapointsToUse);
           
          // Calculate total rating from datapoints
          const totalRating = datapointsToUse.reduce((sum, dp) => {
            const dpRatings = dp.ratings || {};
            return sum + Object.values(dpRatings).reduce((a: number, b: number) => a + b, 0);
          }, 0);
           
          debugLog("Calculated total rating:", totalRating);
           
          setReportData({
            id: "preview",
            hidden_id: "preview",
            project_id: projectToUse?.id || projectId,
            zone_id: zoneToUse?.id || zoneId,
            norm_id: normIdToUse,
            analyst_id: (await supabase.auth.getUser()).data.user?.id,
            created_at: new Date().toISOString(),
            currentVersion: {
              id: "preview-version",
              version_number: 1,
              parameters: datapointsToUse.map(dp => ({
                id: dp.id,
                values: dp.values,
                ratings: dp.ratings
              })),
              total_rating: totalRating,
              classification: "Preview",
              created_at: new Date().toISOString()
            }
          });
        } else {
          throw new Error("Insufficient data to display report");
        }
        
        // Get app version
        getCurrentVersion()
          .then(version => {
            if (version) {
              setCurrentVersion(version.version);
            }
          })
          .catch(versionError => {
            debugLog("Error getting current version:", versionError);
            // Non-critical error, continue with default version
          });
        
        // Get current user info
        supabase.auth.getUser()
          .then(({ data: { user } }) => {
            if (user) {
              setAnalyst({
                name: user.user_metadata?.display_name || user.email || "",
                title: user.user_metadata?.title || "",
                email: user.email || ""
              });
            }
          })
          .catch(userError => {
            debugLog("Error getting user:", userError);
            // Non-critical error, continue with default analyst info
          });
          
        // Load parameter details for all datapoints
        const loadParameterDetails = async () => {
           try {
             // Get all parameter IDs from the datapoints
             const pointsToUse = datapoints.length > 0 ? datapoints : (zone?.datapoints || []);
             if (!pointsToUse || pointsToUse.length === 0) return;
             
             const firstDatapoint = pointsToUse[0];
             if (!firstDatapoint?.values) return;
             
             const paramIds = Object.keys(firstDatapoint.values);
             if (paramIds.length === 0) return;
             
             // Fetch parameter details from database
             const { data, error } = await supabase
               .from("parameters")
               .select("id, name, short_name, unit")
               .in("id", paramIds);
               
             if (error) throw error;
             
             // Create a map of parameter ID to details
             const detailsMap = data.reduce((acc: Record<string, {name: string, unit: string}>, param: any) => {
               acc[param.id] = {
                 name: param.short_name || param.name,
                 unit: param.unit || ""
               };
               return acc;
             }, {});
             
             setParameterDetails(detailsMap);
           } catch (err) {
             console.error("Error loading parameter details:", err);
           }
          };
          
          loadParameterDetails();
      } catch (err) {
        console.error("Error loading report data:", err);
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    
    loadReportData();
  }, [location.search, project, zone, normId]);

  // Helper function to fetch a project by ID
  const fetchProject = async (projectId: string): Promise<Project | null> => {
    try {
      debugLog("Fetching project:", projectId);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      debugLog("Error fetching project:", err);
      return null;
    }
  };
  
  // Helper function to fetch a zone by ID
  const fetchZone = async (zoneId: string): Promise<Zone | null> => {
    try {
      debugLog("Fetching zone:", zoneId);
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("id", zoneId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      debugLog("Error fetching zone:", err);
      return null;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      // This would typically use a PDF generation library
      // For now, we'll just trigger the browser print dialog
      window.print();
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF");
    }
  };

  const handleShare = async () => {
    try {
      // Create a shareable link
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    } catch (err) {
      console.error("Error sharing report:", err);
      setError("Failed to share report");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t("output.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button onClick={onBack} variant="ghost" className="flex items-center gap-2">
            <ChevronLeft size={16} />
            {t("nav.back")}
          </Button>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t("output.error")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <Button onClick={onBack} variant="ghost" className="mb-4 flex items-center gap-2">
          <ChevronLeft size={16} />
          {t("nav.back")}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{t("output.no_data")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t("output.select_report")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate classification based on total rating
  const totalRating = reportData?.currentVersion?.total_rating ?? 0;
  const classification = 
    totalRating >= 0 ? { class: "Ia", stress: t("analysis.stress.very_low") } :
    totalRating >= -4 ? { class: "Ib", stress: t("analysis.stress.low") } :
    totalRating >= -10 ? { class: "II", stress: t("analysis.stress.medium") } :
    { class: "III", stress: t("analysis.stress.high") };

  return (
    <div className="p-6 max-w-[210mm] mx-auto bg-background print:bg-white print:p-0">
      {/* Report Controls - hidden when printing */}
      <div className="flex justify-between items-center mb-6 print:hidden border-b pb-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="flex items-center gap-2">
          <ChevronLeft size={16} />
          {t("nav.back")}
        </Button>
        
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2" title="Print report">
            <Printer size={16} />
            {t("output.print")}
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2" title="Download as PDF">
            <Download size={16} />
            {t("output.download_pdf")}
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex items-center gap-2" title="Share report">
            <Share size={16} />
            {t("output.share")}
          </Button>
        </div>
      </div>

      {/* Report Header */}
      <div className="mb-8 p-6 rounded-lg border border-input bg-card print:border-black print:border print:p-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-foreground print:text-black">{t("analysis.report_title")}</h1>
            <div className="text-sm text-muted-foreground print:text-gray-600 max-w-md">
              {t("analysis.report_subtitle", { standard: norm?.name || "" })}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground print:text-gray-600">
            <div>{new Date(reportData.currentVersion.created_at).toLocaleDateString()}</div>
            <div>
              {t("analysis.report_id")}: {reportData.hidden_id || "Preview"}
            </div> 
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 print:text-gray-600">{t("analysis.project_info")}</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-accent-primary print:text-black" />
                <span className="text-foreground print:text-black">{project?.name || ""}</span>
              </div>
              <div className="text-sm text-muted-foreground print:text-gray-600">
                {t("project.type")}: {project?.typeProject ? t(`project.type.${project.typeProject}`) : ""}
              </div>
              {project?.clientRef && (
                <div className="text-sm text-muted-foreground print:text-gray-600">
                  {t("project.client_ref")}: {project.clientRef}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 print:text-gray-600">{t("analysis.location_info")}</h3>
            <div className="space-y-1">
              <div className="text-foreground print:text-black">{zone?.name || ""}</div>
              {zone?.latitude && zone?.longitude && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground print:text-gray-600">
                  <MapPin size={14} />
                  <span>
                    {zone.latitude}, {zone.longitude}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Methodology */}
      <div className="mb-8 p-6 rounded-lg border border-input bg-card print:border-black print:border print:p-4">
        <h2 className="text-lg font-medium text-foreground mb-4 print:text-black">{t("analysis.methodology")}</h2>
        <div className="space-y-4 text-sm text-muted-foreground print:text-gray-600">
          <p>{t("analysis.methodology_description")}</p>
          <div>
            <strong>{t("analysis.standard_reference")}:</strong>
            <div>{norm?.name || ""}</div>
            {norm?.description && <div>{norm.description}</div>}
          </div>
        </div>
      </div>

      {/* Parameters and Results */}
      <div className="mb-8 p-6 rounded-lg border border-input bg-card print:border-black print:border print:p-4 print:page-break-after-avoid">
        <h2 className="text-lg font-medium text-foreground mb-4 print:text-black">{t("analysis.parameters_results")}</h2>
        {(() => {
          // Get the datapoints to use
          const datapointsToUse = datapoints.length > 0 ? datapoints : (zone?.datapoints || []);
          
          if (!datapointsToUse || datapointsToUse.length === 0) {
            return (
              <div className="p-4 text-center border border-input rounded-md">
                <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No datapoints available for this report</p>
              </div>
            );
          }
          
          // Get the first datapoint
          const firstDatapoint = datapointsToUse[0];
          if (!firstDatapoint?.values || Object.keys(firstDatapoint.values).length === 0) {
            return (
              <div className="p-4 text-center border border-input rounded-md">
                <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Datapoint contains no values</p>
              </div>
            );
          }
          
          return (
          <div className="overflow-x-auto print:border-black print:border print:border-collapse">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="print:text-black">{t("analysis.parameter")}</TableHead>
                  <TableHead className="print:text-black">{t("analysis.value")}</TableHead>
                  <TableHead className="print:text-black">{t("analysis.unit")}</TableHead>
                  <TableHead className="print:text-black">{t("analysis.rating")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(firstDatapoint.values).map(([key, value]) => {
                  const rating = firstDatapoint.ratings?.[key] || 0;
                  const paramDetail = parameterDetails[key] || { name: key, unit: "" };
                  
                  return (
                    <TableRow key={key} className="hover:bg-muted/50">
                      <TableCell className="p-2 border border-input print:border-gray-300 print:text-black">
                        {paramDetail.name || key}
                      </TableCell>
                      <TableCell className="p-2 border border-input print:border-gray-300 print:text-black">{value}</TableCell>
                      <TableCell className="p-2 border border-input print:border-gray-300 print:text-black">
                        {paramDetail.unit || "-"}
                      </TableCell>
                      <TableCell className="p-2 border border-input print:border-gray-300 print:text-black">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: rating >= 0 ? "#22c55e" : "#ef4444",
                            }}
                          />
                          {rating}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/20">
                  <TableCell colSpan={3} className="p-2 border border-input print:border-gray-300 font-bold print:text-black text-right">
                    {t("analysis.total_rating")}
                  </TableCell>
                  <TableCell className="p-2 border border-input print:border-gray-300 font-bold print:text-black">
                    {totalRating}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          );
        })()}</div>

      {/* Analysis Results */}
      <div className="mb-8 p-6 rounded-lg border border-input bg-card print:border-black print:border print:p-4 print:page-break-before-avoid">
        <h2 className="text-lg font-medium text-foreground mb-4 print:text-black">{t("analysis.final_results")}</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground mb-2 print:text-gray-600">
                {t("analysis.classification")}
              </div>
              <div className="text-3xl font-bold text-foreground print:text-black">{classification.class}</div>
              <div className="text-sm text-muted-foreground print:text-gray-600">{classification.stress}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2 print:text-gray-600">{t("analysis.corrosion_risk")}</div>
              <div className="flex items-center gap-2">
                {totalRating >= 0 ? (
                  <>
                    <Check size={20} className="text-green-500" />
                    <span className="text-foreground print:text-black">{t("analysis.risk.low")}</span>
                  </>
                ) : totalRating >= -10 ? (
                  <>
                    <Check size={20} className="text-yellow-500" />
                    <span className="text-foreground print:text-black">{t("analysis.risk.medium")}</span>
                  </>
                ) : (
                  <>
                    <X size={20} className="text-red-500" />
                    <span className="text-foreground print:text-black">{t("analysis.risk.high")}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2 print:text-gray-600">{t("analysis.recommendations")}</div>
            <div className="text-foreground print:text-black">
              {reportData?.currentVersion?.recommendations || (
                totalRating >= 0 
                  ? "No special measures required. Standard corrosion protection is sufficient."
                  : totalRating >= -10
                    ? "Moderate corrosion protection measures recommended."
                    : "Enhanced corrosion protection measures required."
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="text-sm text-muted-foreground border-t border-input pt-4 print:text-gray-600 print:border-t print:border-gray-300">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <User size={14} />
              <span>{analyst?.name}</span>
              {analyst?.title && <span>• {analyst.title}</span>}
              {analyst?.email && <span>• {analyst.email}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{new Date(reportData.currentVersion.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
            <div>
              {t("analysis.software_version")}: {currentVersion}
            </div>
            <div>{t("analysis.page")} 1/1</div>
          </div>
        </div>
      </div>
      
      {/* Print Styles - only applied when printing */}
      <style type="text/css" media="print">{`
@page {
  size: A4;
  margin: 1.5cm;
}

body {
  font-family: Arial, sans-serif;
  color: black;
  background: white;
  margin: 0;
  padding: 0;
}

.print\\:p-0 {
  padding: 0 !important;
}

.print\\:p-4 {
  padding: 1rem !important;
}

.print\\:border {
  border: 1px solid #000 !important;
}

.print\\:border-collapse {
  border-collapse: collapse !important;
}

.print\\:border-t {
  border-top: 1px solid #000 !important;
}

.print\\:border-black {
  border-color: #000 !important;
}

.print\\:border-gray-300 {
  border-color: #d1d5db !important;
}

.print\\:text-black {
  color: #000 !important;
}

.print\\:text-gray-600 {
  color: #4b5563 !important;
}

.print\\:page-break-before-avoid {
  page-break-before: avoid !important;
}

.print\\:page-break-after-avoid {
  page-break-after: avoid !important;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

th, td {
  border: 1px solid #000;
  padding: 8px;
  text-align: left;
}

th {
  font-weight: bold;
  background-color: #f9fafb;
}

.print\\:hidden {
  display: none !important;
}

/* Hide browser UI elements when printing */
@media print {
  nav, header, footer, button, .print\\:hidden {
    display: none !important;
  }
  
  /* Ensure page breaks don't happen inside elements */
  table, tr, td, th {
    page-break-inside: avoid;
  }
  
  /* Force background colors and images to print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
      `}</style>
    </div>
  );
};

export default OutputView;