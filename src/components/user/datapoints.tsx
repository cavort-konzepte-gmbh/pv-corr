import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Project, Zone } from '../../types/projects';
import { Parameter } from '../../types/parameters';
import ZoneSummary from './elements/datapoints/ZoneSummary';
import DatapointList from './elements/datapoints/DatapointList';
import { fetchParameters } from '../../services/parameters';
import ProjectSummary from './elements/fields/ProjectSummary';
import FieldSummary from './elements/zones/FieldSummary';

interface DatapointsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  project?: Project;
  field?: {
    name: string;
    latitude?: string;
    longitude?: string;
  };
  selectedZone?: Zone;
  onBack: () => void;
  onProjectsChange: (projects: Project[]) => void;
  savedPeople?: Person[];
}

const Datapoints: React.FC<DatapointsProps> = ({
  currentTheme,
  currentLanguage,
  project,
  field,
  selectedZone,
  onBack,
  onProjectsChange,
  savedPeople = []
}) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [showProjectSummary, setShowProjectSummary] = useState(false);
  const [showFieldSummary, setShowFieldSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage)

  useEffect(() => {
    const loadParameters = async () => {
      try {
        const fetchedParams = await fetchParameters();
        setParameters(fetchedParams);
      } catch (err) {
        console.error('Error loading parameters:', err);
        setError('Failed to load parameters');
      } finally {
        setLoading(false);
      }
    };
    loadParameters();
  }, []);

  if (!project || !field || !selectedZone) {
    return (
      <div className="p-6 text-center text-secondary">
        {translation("datapoint.please_select_zone")}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-secondary">
        {translation("datapoint.loading_parameters")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-accent-primary">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <ProjectSummary
        isExpanded={showProjectSummary}
        onToggle={() => setShowProjectSummary(!showProjectSummary)}
        project={project}
        manager={savedPeople?.find(p => p.id === project.managerId)}
        company={undefined}
        savedPeople={savedPeople || []}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        onProjectsChange={onProjectsChange}
      />

      <FieldSummary
        isExpanded={showFieldSummary}
        onToggle={() => setShowFieldSummary(!showFieldSummary)}
        field={field}
        onProjectsChange={onProjectsChange}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
      />

      <ZoneSummary
        zone={selectedZone}
        project={project}
        field={field}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        onProjectsChange={onProjectsChange}
      />

      <DatapointList
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        zoneId={selectedZone.id}
        datapoints={selectedZone.datapoints || []}
        parameters={parameters}
        onProjectsChange={onProjectsChange}
      />
    </div>
  );
};

export default Datapoints;