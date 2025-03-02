import React from 'react';
import { Theme } from '../../../../types/theme';
import { Project } from '../../../../types/projects';
import { Person } from '../../../../types/people';
import { Company } from '../../../../types/companies';

interface ProjectHeaderProps {
  project: Project;
  manager?: Person;
  company?: Company;
  currentTheme: Theme;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  manager,
  company,
  currentTheme
}) => {
  return (
    <div className="h-14 flex items-center px-4 border-b-theme bg-surface">
      <div className="flex-1 flex items-center gap-2">
        <span className="text-primary font-medium">{project.name}</span>
        {project.typeProject && (
          <span className="text-secondary">({project.typeProject})</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {project.clientRef && (
          <span className="text-secondary">#{project.clientRef}</span>
        )}
        {company && (
          <span className="text-secondary">{company.name}</span>
        )}
        {manager && (
          <span className="text-secondary">{manager.firstName} {manager.lastName}</span>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;