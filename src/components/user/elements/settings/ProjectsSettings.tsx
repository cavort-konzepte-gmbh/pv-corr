import React from 'react';
import { Theme } from '../../../../types/theme';
import { Project } from '../../../../types/projects';
import { SavedPlace } from '../../../PlacesPanel';
import ProjectsPanel from '../../../ProjectsPanel';

interface ProjectsSettingsProps {
  currentTheme: Theme;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  places: SavedPlace[];
}

const ProjectsSettings: React.FC<ProjectsSettingsProps> = ({ currentTheme, projects, onProjectsChange, places }) => {
  return (
    <ProjectsPanel
      currentTheme={currentTheme}
      projects={projects}
      savedPlaces={places}
      savedPeople={[]}
      savedCompanies={[]}
      onProjectsChange={onProjectsChange}
    />
  );
};

export default ProjectsSettings;
