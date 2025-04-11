import React, { useState, useEffect } from "react";
import { Theme } from "../../../../types/theme";
import { Language, useTranslation } from "../../../../types/language";
import { Parameter } from "../../../../types/parameters";
import { Datapoint } from "../../../../types/projects";
import { Edit2, Save, X, Upload, Clock, Plus } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import MediaDialog from "../../../shared/MediaDialog";
import { fetchProjects } from "../../../../services/projects";
import { updateDatapoint } from "../../../../services/datapoints";
import { FormHandler } from "../../../shared/FormHandler";
import { createDatapoint } from "../../../../services/datapoints";
import { deleteDatapoint } from "../../../../services/datapoints";
import { showToast } from "../../../../lib/toast";
import { fetchDatapointsByZoneId } from "../../../../services/datapoints";
import { ParameterInput } from "../../../DatapointForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DatapointListProps {
  currentTheme: Theme;
  currentLanguage: Language;
  datapoints: Datapoint[];
  parameters: Parameter[];
  zoneId: string;
  onProjectsChange: (projects: any[]) => void;
}

type SortField = "name" | "timestamp" | "parameter";
type SortDirection = "asc" | "desc";

const DatapointList: React.FC<DatapointListProps> = ({
  currentTheme,
  currentLanguage,
  datapoints,
  parameters,
  zoneId,
  onProjectsChange,
}) => {
  const [editingDatapoint, setEditingDatapoint] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [parameterMap, setParameterMap] = useState<Record<string, Parameter>>({});
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [sortParameter, setSortParameter] = useState<string>("");
  const [showMediaDialog, setShowMediaDialog] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage);
  const [isAdding, setIsAdding] = useState(false);
  const [newValues, setNewValues] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Create a map of parameter id to parameter object for easier lookup
    const map = parameters.reduce(
      (acc, param) => {
        acc[param.id] = param;
        return acc;
      },
      {} as Record<string, Parameter>,
    );
    setParameterMap(map);
  }, [parameters]);

  // Fetch datapoints directly when component mounts or zoneId changes
  useEffect(() => {
    const loadDatapoints = async () => {
      if (zoneId) {
        try {
          setIsLoading(true);
          const fetchedDatapoints = await fetchDatapointsByZoneId(zoneId);
          console.log("Directly fetched datapoints:", fetchedDatapoints.length);
          
          // If we have datapoints from direct fetch but not from props, refresh the projects
          if (fetchedDatapoints.length > 0 && datapoints.length === 0) {
            const projects = await fetchProjects();
            onProjectsChange(projects);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadDatapoints();
  }, [zoneId]);

  // Sort datapoints based on current sort field and direction
  const sortedDatapoints = React.useMemo(() => {
    if (!datapoints) return [];
    
    return [...datapoints].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "timestamp":
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case "parameter":
          if (sortParameter) {
            const aValue = a.values?.[sortParameter] || "";
            const bValue = b.values?.[sortParameter] || "";
            
            // Try to compare as numbers if possible
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
              comparison = aNum - bNum;
            } else {
              comparison = String(aValue).localeCompare(String(bValue));
            }
          }
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [datapoints, sortField, sortDirection, sortParameter]);

  const handleSortChange = (field: SortField, paramId?: string) => {
    if (field === "parameter" && paramId) {
      if (sortField === "parameter" && sortParameter === paramId) {
        // Toggle direction if clicking the same parameter
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        // Set new parameter and default to ascending
        setSortField("parameter");
        setSortParameter(paramId);
        setSortDirection("asc");
      }
    } else if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAddDatapoint = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log("Adding new datapoint for zone:", zoneId);
      
      if (!newName.trim()) {
        showToast("Datapoint name is required", "error");
        setError("Datapoint name is required");
        setIsProcessing(false);
        return;
      }
      
      if (Object.keys(newValues).length === 0) {
        showToast("Please enter at least one parameter value", "error");
        setError("Please enter at least one parameter value");
        setIsProcessing(false);
        return;
      }

      // Process values to ensure proper number formatting
      const processedValues: Record<string, any> = {};
      Object.entries(newValues).forEach(([key, value]) => {
        // Convert numeric strings to numbers
        if (typeof value === 'string' && value !== 'impurities' && value.trim() !== '' && !isNaN(parseFloat(value))) {
          processedValues[key] = value; // Keep as string for the service to handle
        } else {
          processedValues[key] = value;
        }
      });

      const result = await createDatapoint(zoneId, {
        type: "measurement",
        name: newName.trim(),
        values: processedValues,
        ratings: {},
      });

      console.log("Datapoint creation result:", result);
      
      setIsAdding(false);
      setNewName("");
      setNewValues({});
      
      const projects = await fetchProjects();
      onProjectsChange(projects);
    } catch (err) {
      console.error("Error creating datapoint:", err);
      setError(`Failed to create datapoint: ${err instanceof Error ? err.message : "Unknown error"}`);
      showToast(`Failed to create datapoint: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateDatapoint = async (datapoint: Datapoint) => {
    if (isProcessing) return;
    
    if (editingDatapoint === datapoint.id) {
      // Save changes
      setIsProcessing(true);
      setError(null);
      
      try {
        if (!editingName?.trim()) {
          setError("Name is required");
          setIsProcessing(false);
          return;
        }
        
        const updateData = {
          values: { ...editingValues },
          name: editingName.trim(),
        };
        
        await updateDatapoint(datapoint.id, updateData);
        const projects = await fetchProjects();
        onProjectsChange(projects);
        
        setEditingDatapoint(null);
        setEditingName("");
        setEditingValues({});
      } catch (err) {
        console.error("Error updating datapoint:", err);
        setError(`Failed to update datapoint: ${err instanceof Error ? err.message : "Unknown error"}`);
        showToast(`Failed to update datapoint: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Start editing
      setEditingDatapoint(datapoint.id);
      setEditingName(datapoint.name);
      // Create a copy of the values to prevent direct modification
      setEditingValues({ ...(datapoint.values || {}) });
    }
  };

  const handleDeleteDatapoint = async (datapointId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    
    try {      
      await deleteDatapoint(datapointId);
      const projects = await fetchProjects();
      onProjectsChange(projects);
      
      // Reset editing state if we just deleted the datapoint we were editing
      if (editingDatapoint === datapointId) {
        setEditingDatapoint(null);
        setEditingName("");
        setEditingValues({});
      }
    } catch (err) {
      console.error("Error deleting datapoint:", err);
      setError(`Failed to delete datapoint: ${err instanceof Error ? err.message : "Unknown error"}`);
      showToast(`Failed to delete datapoint: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <section className="border border-input rounded-md bg-card">
        <div className="w-full relative overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSortChange("name")}
                >
                  <div className="flex items-center gap-1">
                    {translation("datapoint.short_name")}
                    {sortField === "name" ? (
                      <span className="text-xs ml-1">
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    ) : (
                      <ArrowUpDown size={14} className="ml-1 opacity-50" />
                    )}
                  </div>
                </TableHead>
                {parameters.map((param) => (
                  <TableHead 
                    key={param.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSortChange("parameter", param.id)}
                  >
                    <div className="flex items-center gap-1">
                      {param.shortName || param.name}
                      {sortField === "parameter" && sortParameter === param.id ? (
                        <span className="text-xs ml-1">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      ) : (
                        <ArrowUpDown size={14} className="ml-1 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSortChange("timestamp")}
                >
                  <div className="flex items-center gap-1">
                    {translation("actions")}
                    {sortField === "timestamp" ? (
                      <span className="text-xs ml-1">
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    ) : (
                      <ArrowUpDown size={14} className="ml-1 opacity-50" />
                    )}
                  </div>
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                {parameters.map((param) => (
                  <TableHead key={`unit-${param.id}`} className="text-xs text-muted-foreground font-normal">
                    {param.unit || "-"}
                  </TableHead>
                ))}
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow>
                  <TableCell className="p-2">
                    <FormHandler
                      isEditing={true}
                      onSave={handleAddDatapoint}
                      onCancel={() => {
                        setIsAdding(false);
                        setNewName("");
                        setNewValues({});
                      }}
                    >
                      <Input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-1 "
                        placeholder="Enter custom name (optional)"
                        disabled={isProcessing}
                      />
                    </FormHandler>
                  </TableCell>
                  {parameters.map((param) => (
                    <TableCell key={param.id} className="p-2">
                      <ParameterInput
                        parameter={{
                          ...param,
                          parameterCode: param.shortName || param.name,
                        }}
                        value={newValues[param.id] || ""}
                        onChange={(value) =>
                          setNewValues((prev) => ({
                            ...prev,
                            [param.id]: value,
                          }))
                        }
                        currentTheme={currentTheme}
                        disabled={isProcessing}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="p-2 ">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        onClick={handleAddDatapoint} 
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        disabled={isProcessing}
                      >
                        <Save size={14} />
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAdding(false);
                          setNewName("");
                          setNewValues({});
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        disabled={isProcessing}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {sortedDatapoints.map((datapoint) => (
                <TableRow key={datapoint.id}>
                  <TableCell className="p-2">
                    {editingDatapoint === datapoint.id ? (
                      <Input
                        type="text"
                        value={editingName || ""}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full p-1 "
                        placeholder="Enter name"
                        disabled={isProcessing}
                      />
                    ) : (
                      <span>{datapoint.name}</span>
                    )}
                  </TableCell>
                  {parameters.map((param) => (
                    <TableCell key={param.id} className="p-2 text-center w-32">
                      {editingDatapoint === datapoint.id ? (
                        <ParameterInput
                          parameter={{
                            ...param,
                            parameterCode: param.shortName || param.name,
                            rangeType: param.rangeType,
                            rangeValue: param.rangeValue,
                          }}
                          value={editingValues[param.id] || datapoint.values?.[param.id] || ""}
                          onChange={(value) =>
                            setEditingValues((prev) => ({
                              ...prev,
                              [param.id]: value,
                            }))
                          }
                          currentTheme={currentTheme}
                          disabled={isProcessing}
                        />
                      ) : (
                        <span>{datapoint.values?.[param.id] !== undefined ? datapoint.values[param.id] : "-"}</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="p-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="relative group cursor-help" title={new Date(datapoint.timestamp).toLocaleString()}>
                        <Clock size={14} className="text-secondary" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-surface border border-theme invisible group-hover:visible whitespace-nowrap">
                          {new Date(datapoint.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleUpdateDatapoint(datapoint)} 
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        disabled={isProcessing}
                      >
                        {editingDatapoint === datapoint.id ? <Save size={14} /> : <Edit2 size={14} />}
                      </Button>
                      {editingDatapoint === datapoint.id && (
                        <Button
                          onClick={() => handleDeleteDatapoint(datapoint.id)}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                          disabled={isProcessing}
                        >
                          <X size={14} />
                        </Button>
                      )}
                      <Button 
                        onClick={() => setShowMediaDialog(datapoint.id)} 
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        disabled={isProcessing}
                      >
                        <Upload size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      
      {isLoading && datapoints.length === 0 && (
        <div className="mt-4 p-4 text-center text-muted-foreground">
          Loading datapoints...
        </div>
      )}
      
      {!isLoading && datapoints.length === 0 && (
        <div className="mt-4 p-4 text-center text-muted-foreground">
          No datapoints found. Add your first datapoint using the button below.
        </div>
      )}
      
      <Button 
        onClick={() => setIsAdding(true)} 
        className="w-full py-3 px-4 mt-4"
        disabled={isProcessing || isAdding}
      >
        <Plus size={16} />
        {translation("datapoint.add_new")}
      </Button>
      
      {error && <div className="mt-2 p-2 rounded text-sm text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>}

      {showMediaDialog && (
        <MediaDialog
          isOpen={true}
          onClose={() => setShowMediaDialog(null)}
          entityId={showMediaDialog}
          currentTheme={currentTheme}
          entityType="datapoint"
        />
      )}
    </div>
  );
};

export default DatapointList;