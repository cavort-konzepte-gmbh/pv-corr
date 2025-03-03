import React from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Project } from '../../types/projects';
import { Person } from '../../types/people';
import { Company } from '../../types/companies';
import ProjectSummary from './elements/fields/ProjectSummary';
import FieldList from './elements/fields/FieldList';
import FieldForm from './elements/fields/FieldForm';

interface FieldsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  selectedProjectId?: string;
  selectedField: string | undefined;
  onSelectField: (projectId: string, fieldId: string) => void;
  people: Person[];
  companies: Company[];
}

const Fields: React.FC<FieldsProps> = ({
  currentTheme,
  projects,
  selectedProjectId,
  selectedField,
  onSelectField,
  people,
  companies,
  onProjectsChange,
  currentLanguage
}) => {
  const translation = useTranslation(currentLanguage);
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  if (!selectedProject) {
    return (
      <div className="p-6 text-center text-secondary">
        {translation("field.select_project")}
      </div>
    );
  }

  const manager = people.find(person => person.id === selectedProject.managerId);
  const company = companies.find(company => company.id === selectedProject.companyId);

  return (
    <div className="p-6">
      <ProjectSummary
        project={selectedProject}
        manager={manager}
        company={company}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
      />
      
      <FieldForm
        currentTheme={currentTheme}
        selectedProjectId={selectedProject.id}
        onProjectsChange={onProjectsChange}
        currentLanguage={currentLanguage}
      />

      <FieldList
        currentTheme={currentTheme}
        fields={selectedProject.fields}
        onSelectField={(fieldId) => onSelectField(selectedProject.id, fieldId)}
        onProjectsChange={onProjectsChange}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default Fields;