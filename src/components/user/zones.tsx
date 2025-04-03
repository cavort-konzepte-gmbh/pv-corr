import React, { useEffect } from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { Project } from "../../types/projects";
import { Person } from "../../types/people";
import { Company } from "../../types/companies";
import { useState } from "react";
import FieldSummary from "./elements/zones/FieldSummary";
import ZoneList from "./elements/zones/ZoneList";
import ProjectSummary from "./elements/fields/ProjectSummary";
import { useAppDispatch, useAppSelector } from "@/store/slices/hooks";
import { getAllZonesByFieldId } from "@/services/zones";
import { selectAllZones } from "@/store/slices/zonesSlice";

interface ZonesProps {
  currentLanguage: Language;
  projects: Project[];
  selectedProjectId?: string;
  selectedFieldId?: string;
  onSelectZone: (zoneId: string) => void;
  people: Person[];
  companies: Company[];
}

const Zones: React.FC<ZonesProps> = ({
  projects,
  selectedProjectId,
  selectedFieldId,
  onSelectZone,
  people,
  companies,
  currentLanguage,
}) => {
  const dispatch = useAppDispatch();
  const transition = useTranslation(currentLanguage);
  const zones = useAppSelector((state) => selectAllZones(state));

  useEffect(() => {
    if (!selectedFieldId) return;
    dispatch(getAllZonesByFieldId(selectedFieldId));
  }, []);

  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null;

  const selectedField = selectedProject && selectedFieldId ? selectedProject.fields.find((f: any) => f.id === selectedFieldId) : null;

  if (!selectedProject || !selectedField) {
    return <div className="p-6 text-center">{transition("zones.please_select_field")}</div>;
  }

  const manager = people.find((person) => person.id === selectedProject.managerId);
  const company = companies.find((company) => company.id === selectedProject.companyId);

  const [showProjectSummary, setShowProjectSummary] = useState(false);

  return (
    <div className="p-6">
      <ProjectSummary
        project={selectedProject}
        manager={manager}
        company={company}
        currentLanguage={currentLanguage}
        savedPeople={people}
        isExpanded={showProjectSummary}
        onToggle={() => setShowProjectSummary(!showProjectSummary)}
      />

      <FieldSummary field={selectedField} currentLanguage={currentLanguage} />

      <ZoneList zones={zones} selectedFieldId={selectedField.id} onSelectZone={onSelectZone} currentLanguage={currentLanguage} />
    </div>
  );
};

export default Zones;
