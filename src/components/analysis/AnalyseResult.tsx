import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { FileText, ChevronDown, ChevronRight, FileCheck } from "lucide-react";
import { Datapoint } from "../../types/projects";
import { supabase } from "../../lib/supabase";
import { showToast } from "../../lib/toast";
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
  const [initializing, setInitializing] = useState(true);
  const [expandedDatapoints, setExpandedDatapoints] = useState<Set<string>>(new Set());
  const [parameters, setParameters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [normParameters, setNormParameters] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [parameterMap, setParameterMap] = useState<Record<string, any>>({});
  const [navigating, setNavigating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Safety check for selectedNorm
      if (!selectedNorm) {
        setError("No norm selected. Please select a valid norm.");
        setLoading(false);
        return;
      }

      // Validate selectedNorm structure
      if (!selectedNorm.parameters || !Array.isArray(selectedNorm.parameters)) {
        setError("Invalid norm structure. The norm parameters are missing or invalid.");
        setLoading(false);
        return;
      }
      
      // Create set of parameter IDs from norm
      const paramIds = new Set(selectedNorm.parameters.map((p: any) => p.parameter_id));
      setNormParameters(paramIds);
      
      // Initialize with a short delay to ensure all data is loaded
      setTimeout(() => {
        setInitializing(false);
      }, 100);
    } catch (err) {
      console.error("Error initializing norm parameters:", err);
      setError("Failed to initialize norm parameters");
      setLoading(false);
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
        
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid parameters data received");
        }

        setParameters(data);

        // Create parameter map for easier lookup
        const map = data.reduce((acc: Record<string, any>, param: any) => {
          acc[param.id] = param;
          return acc;
        }, {});
        setParameterMap(map);
      } catch (err) {
        console.error("Error loading parameters:", err);
        setError("Failed to load parameters: " + (err instanceof Error ? err.message : String(err)));
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
      // Validate required data before proceeding
      if (!selectedNorm) {
        throw new Error("No norm selected");
      }
      if (!selectedDatapoints.length) {
        throw new Error("No datapoints selected");
      }

      setIsSaving(true);
      const toastId = showToast("Creating report...", "loading");
      
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

      showToast("Report created successfully", "success", { id: toastId });
      
      // Navigate to the output view with the report ID
      setNavigating(true);
      window.location.href = `/?view=output&reportId=${report.id}&datapointIds=${datapointIds}`;
    } catch (err) {
      console.error("Error creating report:", err);
      setSaveError("Failed to create report: " + (err instanceof Error ? err.message : String(err)));
      showToast(`Failed to create report: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
      setNavigating(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while initializing or loading parameters
  if (loading || initializing) {
    return <div className="text-center p-4 text-secondary">{t("analysis.loading")}</div>;
  }

  // Show error if there's an issue
  if (error) {
    return <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>;
  }

  // Safety check for selectedNorm
  if (!selectedNorm) {
    return <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
      {t("analysis.no_norm_selected")}
    </div>;
  }

  // Calculate results for each datapoint
  const results = selectedDatapoints.map((datapoint) => {
    // Calculate ratings for each parameter
    const parameterRatings: Record<string, { value: string; rating: number; unit?: string }> = {};
    
    // Debug the datapoint values
    console.log("Processing datapoint values:", datapoint.values);
    
    // Process each parameter in the datapoint values
    Object.entries(datapoint.values || {})
      .filter(([paramId]) => normParameters.has(paramId))
      .forEach(([paramId, value]) => {
        const parameter = parameterMap[paramId];
        if (!parameter) return;

        // Debug the parameter processing
        console.log(`Processing parameter ${parameter.shortName || parameter.name} with value ${value}`);
        
        // Execute rating logic code if available
        let rating = 0;
        if (parameter.rating_logic_code) {
          try {
            // Create a function from the rating logic code
            const calculateRating = new Function("value", parameter.rating_logic_code);
            console.log(`Executing rating logic for ${parameter.shortName || parameter.name}`);
            rating = calculateRating(value);
            console.log(`Rating result: ${rating}`);
          } catch (err) {
            console.error(`Error calculating rating for parameter ${parameter.short_name}:`, err);
          }
        } else {
          // If no rating logic code, use the datapoint's rating if available
          rating = (datapoint.ratings && datapoint.ratings[paramId]) || 0;
          console.log(`Using existing rating: ${rating}`);
        }

        const paramName = parameter.shortName || parameter.name;
        parameterRatings[paramName] = {
          value,
          rating,
          unit: parameter.unit,
        };
      });

    // Initialize outputs object
    const outputs: Record<string, number> = {};

    // Get all ratings for parameters Z1-Z15
    const zRatings: Record<number, number> = {};
    
    // Debug the ratings
    console.log("Datapoint ratings:", datapoint.ratings);
    
    // Process each parameter rating
    if (datapoint.ratings) {
      Object.entries(datapoint.ratings).forEach(([paramId, rating]) => {
        const param = parameterMap[paramId];
        if (!param?.shortName) return;

        // Match Z1-Z15 pattern
        const match = param.shortName.match(/^Z(\d+)$/i);
        if (!match) return;

        const num = parseInt(match[1]);
        if (num >= 1 && num <= 15) {
          zRatings[num] = rating;
        }
      });
    }

    // Debug Z ratings
    console.log("Z ratings:", zRatings);
    
    // Process each output formula from the norm configuration
    if (selectedNorm?.output_config && Array.isArray(selectedNorm.output_config)) {
      console.log("Processing output config:", selectedNorm.output_config);
      selectedNorm.output_config.forEach((output: any) => {
        if (output && output.id && output.formula) {
          try {
            // Create a context with parameter values and ratings
            const context: Record<string, any> = {
              values: {},
              ratings: {},
            };
            
            // Add all parameter values to the context
            Object.entries(datapoint.values || {}).forEach(([paramId, value]) => {
              const param = parameterMap[paramId];
              if (param?.shortName) {
                // Convert string numbers to actual numbers
                let numValue = value;
                if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                  numValue = parseFloat(value);
                }
                console.log(`Setting context value ${param.shortName} = ${numValue}`);
                context.values[param.shortName] = numValue;
              }
            });
            
            // Add all parameter ratings to the context
            if (datapoint.ratings) {
              Object.entries(datapoint.ratings).forEach(([paramId, rating]) => {
              const param = parameterMap[paramId];
              if (param?.shortName) {
                console.log(`Setting context rating ${param.shortName} = ${rating}`);
                context.ratings[param.shortName] = rating;
              }
              });
            }
            
            // Add Z1-Z15 ratings directly to the context for easier access
            Object.entries(zRatings).forEach(([num, rating]) => {
              console.log(`Setting Z${num} = ${rating}`);
              context[`Z${num}`] = rating;
            });
            
            // Create a function from the formula and execute it with the context
            try {
              // Wrap the formula in a return statement if it doesn't have one
              let formula = output.formula.trim();
              if (!formula.startsWith('return ') && !formula.includes('return ')) {
                formula = `return ${formula}`;
              }
              
              console.log(`Executing formula for ${output.id}: ${formula}`);
              try {
                const calculateOutput = new Function('values', 'ratings', formula);
                const result = calculateOutput(context.values, context.ratings);
                
                // Handle array results (like zinc loss rate)
                if (Array.isArray(result)) {
                  // Store the first value for display purposes
                  outputs[output.id] = result[0];
                  // Store the full array for detailed calculations
                  outputs[`${output.id}_full`] = result;
                } else {
                  outputs[output.id] = result;
                }
              } catch (calcError) {
                console.error(`Error executing calculation for ${output.id}:`, calcError);
                outputs[output.id] = 0;
              }
              console.log(`Output ${output.id} = ${outputs[output.id]}`);
            } catch (err) {
              console.error(`Error executing formula for output ${output.id}:`, err);
              outputs[output.id] = 0; // Default to 0 on error
            }
          } catch (err) {
            console.error(`Error calculating output ${output.id}:`, err);
            outputs[output.id] = 0; // Default to 0 on error
          }
        }
      });
    } else {
      // Fallback to default calculations if no output_config is available
      console.log("Using fallback calculations");
      // Calculate B0 (sum of Z1-Z10)
      outputs.b0 = Object.entries(zRatings).reduce((sum, [num, rating]) => {
        if (parseInt(num) <= 10) {
          console.log(`Adding Z${num} (${rating}) to B0`);
          return sum + rating;
        }
        return sum;
      }, 0);
      console.log("Calculated B0:", outputs.b0);

      // Calculate B1 (B0 + sum of Z11-Z15)
      outputs.b1 =
        outputs.b0 +
        Object.entries(zRatings).reduce((sum, [num, rating]) => {
          if (parseInt(num) > 10 && parseInt(num) <= 15) {
            console.log(`Adding Z${num} (${rating}) to B1`);
            return sum + rating;
          }
          return sum;
        }, 0);
      console.log("Calculated B1:", outputs.b1);
    }

    // Get B0 value for classification
    const b0 = outputs.b0 || 0;
    console.log("Final B0 value for classification:", b0);

    // Classify results
    const classification =
      b0 >= 0
        ? { class: "Ia", stress: t("analysis.stress.very_low") }
        : b0 >= -4
          ? { class: "Ib", stress: t("analysis.stress.low") }
          : b0 >= -10
            ? { class: "II", stress: t("analysis.stress.medium") }
            : { class: "III", stress: t("analysis.stress.high") };
    console.log("Classification:", classification);

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
                {Array.isArray(selectedNorm?.output_config) && selectedNorm.output_config.map((output: any) => (
                  output && output.id && (
                  <div key={output.id} className="text-sm px-3 py-1 rounded bg-opacity-20  bg-border" title={output.description}>
                    {output.name}: {(() => {
                      // Special handling for array outputs like zinc loss rate
                      if (Array.isArray(outputs[`${output.id}_full`])) {
                        return `${outputs[`${output.id}_full`][0]} ± ${outputs[`${output.id}_full`][1]}`;
                      } else if (output.id === 'zincLossRate' && Array.isArray(outputs[output.id])) {
                        return `${outputs[output.id][0]} ± ${outputs[output.id][1]}`;
                      } else if (typeof outputs[output.id] === 'number') {
                        return outputs[output.id].toFixed(2);
                      } else {
                        return '0.00';
                      }
                    })()}
                    {output.id === "b0" && ` (${classification.class} - ${classification.stress})`}
                  </div>
                  )
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