import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { Project, Zone } from "../../types/projects";
import { Parameter } from "../../types/parameters";
import ZoneSummary from "./elements/datapoints/ZoneSummary";
import FieldSummary from "./elements/zones/FieldSummary";
import ProjectSummary from "./elements/fields/ProjectSummary";
import ParameterFilter from "./elements/datapoints/ParameterFilter";
import DatapointList from "./elements/datapoints/DatapointList";
import { fetchParameters } from "../../services/parameters";
import { fetchDatapointsByZoneId } from "../../services/datapoints";
import { Person } from "../../types/people";

interface DatapointsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  project?: Project;
  field?: {
    name: string;
    latitude?: string;
    longitude?: string;
  };
  selectedZone?: Zone;
  onBack: () => void;
  onProjectsChange: (projects: Project[]) => void;
  savedPeople?: Person[];
  companies?: Company[];
  selectedCustomerId: string | null;
}

const Datapoints: React.FC<DatapointsProps> = ({
  currentTheme,
  currentLanguage,
  project,
  field,
  selectedZone,
  onBack,
  onProjectsChange,
  savedPeople = [],
  companies = [],
  selectedCustomerId,
}) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [filteredParameters, setFilteredParameters] = useState<Parameter[]>([]);
  const [showProjectSummary, setShowProjectSummary] = useState(false);
  const [showFieldSummary, setShowFieldSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoneDatapoints, setZoneDatapoints] = useState<Datapoint[]>([]);
  const translation = useTranslation(currentLanguage);

  useEffect(() => {
    const loadParameters = async () => {
      try {
        const fetchedParams = await fetchParameters();
        setParameters(fetchedParams);
        setFilteredParameters(fetchedParams);
      } catch (err) {
        console.error("Error loading parameters:", err);
        setError("Failed to load parameters");
      } finally {
        setLoading(false);
      }
    };
    loadParameters();
  }, []);

  // Fetch datapoints directly when zone changes
  useEffect(() => {
    const loadDatapoints = async () => {
      if (selectedZone?.id) {
        try {
          setLoading(true);
          const datapoints = await fetchDatapointsByZoneId(selectedZone.id);
          console.log("Fetched datapoints:", datapoints);
          setZoneDatapoints(datapoints);
        } catch (err) {
          console.error("Error loading datapoints:", err);
          setError("Failed to load datapoints");
        } finally {
          setLoading(false);
        }
      }
    };

    loadDatapoints();
  }, [selectedZone?.id]);

  if (!project || !field || !selectedZone) {
    return <div className="p-6 text-center text-secondary">{translation("datapoint.please_select_zone")}</div>;
  }

  if (loading) {
    return <div className="p-6 text-center text-secondary">{translation("datapoint.loading_parameters")}</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-accent-primary">{error}</div>;
  }

  return (
    <div className="p-6">
      <ProjectSummary
        isExpanded={showProjectSummary}
        isExpanded={showProjectSummary}
        onToggle={() => setShowProjectSummary(!showProjectSummary)}
        project={project}
        manager={savedPeople?.find((p) => p.id === project.managerId)}
        company={undefined}
        savedPeople={savedPeople || []}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        onProjectsChange={onProjectsChange}
        onToggle={() => setShowProjectSummary(!showProjectSummary)}
        selectedCustomerId={selectedCustomerId}
      />

      <FieldSummary
        isExpanded={showFieldSummary}
        onToggle={() => setShowFieldSummary(!showFieldSummary)}
        field={field}
        onProjectsChange={onProjectsChange}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
      />

      <ZoneSummary
        zone={selectedZone}
        project={project}
        field={field}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        onProjectsChange={onProjectsChange}
      />

      <ParameterFilter
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        parameters={parameters}
        onParametersChange={setFilteredParameters}
      />

      <DatapointList
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        zoneId={selectedZone.id || ""}
        datapoints={zoneDatapoints.length > 0 ? zoneDatapoints : selectedZone.datapoints || []}
        parameters={filteredParameters}
        onProjectsChange={onProjectsChange}
      />
    </div>
  );
};

export default Datapoints;
