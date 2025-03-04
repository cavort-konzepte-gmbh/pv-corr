import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Project, Field } from '../../types/projects';
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
  selectedCustomerId: string | null
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
  currentLanguage,
  selectedCustomerId
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
        currentLanguage={currentLanguage}
        savedPeople={people}
        onProjectsChange={onProjectsChange}
        selectedCustomerId={selectedCustomerId}
        currentLanguage={currentLanguage}
      />

      <FieldList
        currentTheme={currentTheme}
        fields={selectedProject.fields || []}
        onSelectField={(fieldId) => onSelectField(selectedProject.id, fieldId)}
        onProjectsChange={onProjectsChange}
        currentLanguage={currentLanguage}
        selectedProjectId={selectedProject.id}
        selectedCustomerId={selectedCustomerId}
      />
    </div>
  );
};

export default Fields;