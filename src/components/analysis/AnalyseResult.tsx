import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { FileText, ChevronDown, ChevronRight, FileCheck } from "lucide-react";
import { Datapoint } from "../../types/projects";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { createReport } from "../../services/reports";

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
  zone,
}) => {
  const t = useTranslation(currentLanguage);
  const [expandedDatapoints, setExpandedDatapoints] = useState<Set<string>>(new Set());
  const [parameters, setParameters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [normParameters, setNormParameters] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [parameterMap, setParameterMap] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    // Create set of parameter IDs from norm
    if (selectedNorm?.parameters) {
      const paramIds = new Set(selectedNorm.parameters.map((p: any) => p.parameter_id));
      setNormParameters(paramIds);
    }
  }, [selectedNorm]);

  useEffect(() => {
    const loadParameters = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("parameters")
          .select(
            `
            id,
            name,
            short_name,
            unit,
            rating_logic_code
          `,
          )
          .order("created_at", { ascending: true });

        if (error) throw error;
        setParameters(data || []);

        // Create parameter map for easier lookup
        const map = data.reduce((acc: Record<string, any>, param: any) => {
          acc[param.id] = param;
          return acc;
        }, {});
        setParameterMap(map);
      } catch (err) {
        console.error("Error loading parameters:", err);
        setError("Failed to load parameters");
      } finally {
        setLoading(false);
      }
    };

    loadParameters();
  }, []);

  const toggleDatapoint = (id: string) => {
    setExpandedDatapoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateReport = async () => {
    try {
      setIsSaving(true);
      
      // Calculate total rating
      const totalRating = selectedDatapoints.reduce((sum, dp) => {
        return sum + Object.values(dp.ratings || {}).reduce((a, b) => a + b, 0);
      }, 0);

      // Determine classification based on total rating
      const classification = 
        totalRating >= 0 ? "Ia" :
        totalRating >= -4 ? "Ib" :
        totalRating >= -10 ? "II" : "III";

      // Create report data
      const reportData = {
        projectId: project.id,
        zoneId: zone.id,
        standardId: selectedNorm.id,
        content: {
          projectName: project.name,
          zoneName: zone.name,
          normName: selectedNorm.name,
          timestamp: new Date().toISOString(),
        },
        parameters: selectedDatapoints.map(dp => ({
          id: dp.id,
          values: dp.values,
          ratings: dp.ratings,
        })),
        ratings: selectedDatapoints.reduce((acc, dp) => ({ ...acc, [dp.id]: dp.ratings }), {}),
        totalRating,
        classification,
        recommendations: totalRating >= 0 
          ? "No special measures required. Standard corrosion protection is sufficient."
          : totalRating >= -10
            ? "Moderate corrosion protection measures recommended."
            : "Enhanced corrosion protection measures required.",
      };

      // Get the datapoint IDs to include in the URL
      const datapointIds = selectedDatapoints.map(dp => dp.id).join(',');

      // Create the report
      const { report } = await createReport(reportData);

      // Navigate to the output view with the report ID
      setNavigating(true);
      window.location.href = `/?view=output&reportId=${report.id}&datapointIds=${datapointIds}`;
    } catch (err) {
      console.error("Error creating report:", err);
      setSaveError("Failed to create report: " + (err instanceof Error ? err.message : String(err)));
      setNavigating(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4 text-secondary">{t("analysis.loading")}</div>;
  }

  if (error) {
    return <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>;
  }

  // Calculate results for each datapoint
  const results = selectedDatapoints.map((datapoint) => {
    // Calculate ratings for each parameter
    const parameterRatings = Object.entries(datapoint.values)
      .filter(([paramId]) => normParameters.has(paramId))
      .reduce(
        (acc, [paramId, value]) => {
          const parameter = parameterMap[paramId];
          if (!parameter) return acc;

          // Execute rating logic code if available
          let rating = 0;
          if (parameter.rating_logic_code) {
            try {
              // Create a function from the rating logic code
              const calculateRating = new Function("value", parameter.rating_logic_code);
              rating = calculateRating(value);
            } catch (err) {
              console.error(`Error calculating rating for parameter ${parameter.short_name}:`, err);
            }
          }

          const paramName = parameter.short_name || parameter.name;
          acc[paramName] = {
            value,
            rating,
            unit: parameter.unit,
          };

          return acc;
        },
        {} as Record<string, { value: string; rating: number; unit?: string }>,
      );

    // Calculate B0 and B1 from ratings
    const outputs: Record<string, number> = { b0: 0, b1: 0 };

    // Get all ratings for parameters Z1-Z15
    const zRatings = Object.entries(datapoint.ratings || {}).reduce(
      (acc, [paramId, rating]) => {
        const param = parameterMap[paramId];
        if (!param?.short_name) return acc;

        // Match Z1-Z15 pattern
        const match = param.short_name.match(/^Z(\d+)$/i);
        if (!match) return acc;

        const num = parseInt(match[1]);
        if (num >= 1 && num <= 15) {
          acc[num] = rating;
        }
        return acc;
      },
      {} as Record<number, number>,
    );

    // Calculate B0 (sum of Z1-Z10)
    outputs.b0 = Object.entries(zRatings).reduce((sum, [num, rating]) => {
      if (parseInt(num) <= 10) {
        return sum + rating;
      }
      return sum;
    }, 0);

    // Calculate B1 (B0 + sum of Z11-Z15)
    outputs.b1 =
      outputs.b0 +
      Object.entries(zRatings).reduce((sum, [num, rating]) => {
        if (parseInt(num) > 10 && parseInt(num) <= 15) {
          return sum + rating;
        }
        return sum;
      }, 0);

    // Get B0 value for classification
    const b0 = outputs.b0 || 0;

    // Classify results
    const classification =
      b0 >= 0
        ? { class: "Ia", stress: t("analysis.stress.very_low") }
        : b0 >= -4
          ? { class: "Ib", stress: t("analysis.stress.low") }
          : b0 >= -10
            ? { class: "II", stress: t("analysis.stress.medium") }
            : { class: "III", stress: t("analysis.stress.high") };

    return {
      datapoint,
      parameterRatings,
      outputs,
      classification,
    };
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium  mb-4">{t("analysis.results")}</h3>

      <div className="space-y-4">
        {results.map(({ datapoint, parameterRatings, outputs, classification }) => (
          <div key={datapoint.id} className="p-4 rounded-lg border border-theme ">
            <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleDatapoint(datapoint.id)}>
              <div className="font-medium ">{datapoint.name}</div>
              <div className="flex items-center gap-4">
                <div className="text-sm ">{new Date(datapoint.timestamp).toLocaleString()}</div>
                {expandedDatapoints.has(datapoint.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {selectedNorm?.output_config?.map((output: any) => (
                  <div key={output.id} className="text-sm px-3 py-1 rounded bg-opacity-20  bg-border" title={output.description}>
                    {output.name}: {outputs[output.id] || 0}
                    {output.id === "b0" && ` (${classification.class} - ${classification.stress})`}
                  </div>
                ))}
              </div>

              {expandedDatapoints.has(datapoint.id) && (
                <Table>
                  <TableCaption>{t("analysis.parameter_ratings")}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead> {t("analysis.parameter")}</TableHead>
                      <TableHead>{t("analysis.value")}</TableHead>
                      <TableHead>{t("analysis.rating")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(parameterRatings)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([code, { value, rating, unit }]) => (
                        <TableRow key={code}>
                          <TableCell className="p-2">{code.toUpperCase()}</TableCell>
                          <TableCell className="p-2">
                            {value} {unit && <span className="text-secondary">({unit})</span>}
                          </TableCell>
                          <TableCell className="p-2 ">{rating}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Create Report Button */}
      <div className="flex justify-between items-center mt-8 border-t pt-6 border-input bg-card p-4 rounded-lg">
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2">{t("analysis.report_options")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
          {t("analysis.report_description")}
       
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              try {
                // Prevent multiple clicks
                if (navigating) return;
                setNavigating(true);
                
                // Get the datapoint IDs to include in the URL
                const datapointIds = selectedDatapoints.map(dp => dp.id).join(',');
                
                // Navigate to output view with preview parameters and datapoint IDs
                window.location.href = `/?view=output&preview=true&projectId=${project.id}&zoneId=${zone.id}&normId=${selectedNorm.id}&datapointIds=${datapointIds}`;
              } catch (err) {
                console.error("Error navigating to preview:", err);
                setNavigating(false);
              }
            }}
            title="Preview a report from the selected datapoints"
            disabled={navigating || selectedDatapoints.length === 0}
            variant="outline"
            className="px-6 py-3 rounded text-sm flex items-center gap-2"
          >
            <FileText size={16} />
            {t("analysis.preview_report")}
          </Button>
          <Button
            onClick={handleCreateReport}
            disabled={navigating || selectedDatapoints.length === 0}
            className="px-6 py-3 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
          >
            <FileCheck size={16} />
            {isSaving ? t("analysis.creating_report") : t("analysis.create_report")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyseResult;