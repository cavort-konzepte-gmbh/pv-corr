import React from 'react';
import { Theme } from '../../types/theme';
import { Project } from '../../types/projects';
import { Customer } from '../../types/customers';
import { SavedPlace } from '../PlacesPanel';
import { Person } from '../../types/people';
import { Company } from '../../types/companies';
import ProjectList from './elements/projects/ProjectList';
import ProjectForm from './elements/projects/ProjectForm';

interface ProjectsProps {
  currentTheme: Theme;
  projects: Project[];
  savedPeople: Person[];
  savedCompanies: Company[];
  customers: Customer[];
  selectedCustomerId: string | null;
  onMoveProject: (projectId: string, customerId: string | null) => void;
  onSelectProject: (projectId: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({
  currentTheme,
  projects,
  savedPeople,
  savedCompanies,
  customers,
  selectedCustomerId,
  onMoveProject,
  onSelectProject
}) => {
  return (
    <div className="p-6">
      <ProjectForm
        currentTheme={currentTheme}
        savedPeople={savedPeople}
        savedCompanies={savedCompanies}
      />
      <ProjectList
        currentTheme={currentTheme}
        projects={projects}
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        onMoveProject={onMoveProject}
        onSelectProject={onSelectProject}
      />
    </div>
  );
};

export default Projects;