import React from 'react';
import { Theme } from '../../../../types/theme';
import { Project, Zone } from '../../../../types/projects';
import { ArrowLeft } from 'lucide-react';

interface ProjectHeaderProps {
  project: Project;
  field: {
    name: string;
    latitude?: string;
    longitude?: string;
  };
  zone: Zone;
  onBack: () => void;
  currentTheme: Theme;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  field,
  zone,
  onBack,
  currentTheme
}) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onBack}
        className="p-2 rounded hover:bg-opacity-80 text-secondary"
      >
        <ArrowLeft size={20} />
      </button>
      <div>
        <div className="text-2xl font-bold text-primary">
          {zone.name}
        </div>
        <div className="text-sm text-secondary">
          {project.name} • {field.name}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;