import React from 'react';
import { Theme } from '../../../../types/theme';
import { Project } from '../../../../types/projects';
import { Folder, MapPin, ChevronRight } from 'lucide-react';
import { Language, useTranslation } from '../../../../types/language';

interface ProjectListProps {
  currentTheme: Theme;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  currentLanguage: Language;
}

const ProjectList: React.FC<ProjectListProps> = ({
  currentTheme,
  projects,
  onSelectProject,
  currentLanguage,
}) => {
  const translation = useTranslation(currentLanguage)
  return (
    <div className="space-y-4">
      {projects.map(project => (
        <div
          key={project.id}
          className="p-4 rounded-lg border transition-all hover:translate-x-1 text-primary border-theme bg-surface"
          onClick={() => onSelectProject(project.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Folder className="text-accent-primary" size={16} />
              <span className="font-medium">{project.name}</span>                
            </div>
            <ChevronRight className="text-secondary" size={16} />
          </div>
          <div className="text-sm text-secondary">
            {project.fields.length} {translation("fields").toLowerCase()} • {
              project.fields.reduce((acc, field) => acc + field.zones.length, 0)
            } {translation("zones").toLowerCase()} • {
              project.fields.reduce((acc, field) => 
                acc + field.zones.reduce((zAcc, zone) => 
                  zAcc + (zone.datapoints?.length || 0), 0
                ), 0
            ) } {translation("datapoints").toLowerCase()} • {translation("project.type")}: {project.typeProject}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;