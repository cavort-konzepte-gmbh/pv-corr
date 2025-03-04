import React from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Project } from '../../types/projects';
import { Person } from '../../types/people';
import { Company } from '../../types/companies';
import { useState } from 'react';
import FieldSummary from './elements/zones/FieldSummary';
import ZoneList from './elements/zones/ZoneList';
import ZoneForm from './elements/zones/ZoneForm';
import ProjectSummary from './elements/fields/ProjectSummary';

interface ZonesProps {
  currentTheme: Theme;
  currentLanguage: Language;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  selectedProjectId?: string;
  selectedFieldId?: string;
  onSelectZone: (zoneId: string) => void;
  people: Person[];
  companies: Company[];
}

const Zones: React.FC<ZonesProps> = ({
  currentTheme,
  projects,
  selectedProjectId,
  selectedFieldId,
  onSelectZone,
  people,
  companies,
  onProjectsChange,
  currentLanguage,
}) => {
  const transition = useTranslation(currentLanguage)

  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  const selectedField = selectedProject && selectedFieldId
    ? selectedProject.fields.find(f => f.id === selectedFieldId)
    : null;

  if (!selectedProject || !selectedField) {
    return (
      <div 
        className="p-6 text-center"
        style={{ color: currentTheme.colors.text.secondary }}
      >
        {transition("zones.please_select_field")}
      </div>
    );
  }

  const manager = people.find(person => person.id === selectedProject.managerId);
  const company = companies.find(company => company.id === selectedProject.companyId);

  const [showProjectSummary, setShowProjectSummary] = useState(false);

  return (
    <div className="p-6">
      <ProjectSummary
        project={selectedProject}
        manager={manager}
        company={company}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        savedPeople={people}
        isExpanded={showProjectSummary}
        onToggle={() => setShowProjectSummary(!showProjectSummary)}
        onProjectsChange={onProjectsChange}
        selectedCustomerId={selectedProject.companyId}
      />

      <FieldSummary
        field={selectedField}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        onProjectsChange={onProjectsChange}
      />

      <ZoneList
        currentTheme={currentTheme}
        zones={selectedField.zones}
        selectedFieldId={selectedField.id}
        onSelectZone={onSelectZone}
        onProjectsChange={onProjectsChange}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default Zones;