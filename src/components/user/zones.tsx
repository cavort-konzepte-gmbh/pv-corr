import React from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Project } from '../../types/projects';
import { Person } from '../../types/people';
import { Company } from '../../types/companies';
import ProjectHeader from './elements/zones/ProjectHeader';
import FieldSummary from './elements/zones/FieldSummary';
import ZoneList from './elements/zones/ZoneList';
import ZoneForm from './elements/zones/ZoneForm';

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

  return (
    <div className="min-h-screen bg-theme">
      <ProjectHeader
        project={selectedProject}
        manager={manager}
        company={company}
        currentTheme={currentTheme}
      />

      <div className="p-6">
        <FieldSummary
          field={selectedField}
          currentTheme={currentTheme}
          onProjectsChange={onProjectsChange}
        />

        <ZoneForm
          currentTheme={currentTheme}
          selectedFieldId={selectedField.id}
          onProjectsChange={onProjectsChange}
          currentLanguage={currentLanguage}
        />

        <ZoneList
          currentTheme={currentTheme}
          zones={selectedField.zones}
          onSelectZone={onSelectZone}
          onProjectsChange={onProjectsChange}
          currentLanguage={currentLanguage}
        />
      </div>
    </div>
  );
};

export default Zones;