import React from 'react';
import { Theme } from '../../types/theme';
import { Language } from '../../types/language';
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
  onProjectsChange
}) => {
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  if (!selectedProject) {
    return (
      <div 
        className="p-6 text-center"
        style={{ color: currentTheme.colors.text.secondary }}
      >
        Please select a project to view its fields
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
      />
      
      <FieldForm
        currentTheme={currentTheme}
        selectedProjectId={selectedProject.id}
        onProjectsChange={onProjectsChange}
      />

      <FieldList
        currentTheme={currentTheme}
        fields={selectedProject.fields}
        onSelectField={(fieldId) => onSelectField(selectedProject.id, fieldId)}
      />
    </div>
  );
};

export default Fields;