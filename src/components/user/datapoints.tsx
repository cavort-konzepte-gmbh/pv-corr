import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Project, Zone } from '../../types/projects';
import { Parameter } from '../../types/parameters';
import ProjectHeader from './elements/datapoints/ProjectHeader';
import ZoneSummary from './elements/datapoints/ZoneSummary';
import DatapointList from './elements/datapoints/DatapointList';
import DatapointForm from './elements/datapoints/DatapointForm';
import { fetchParameters } from '../../services/parameters';

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
}

const Datapoints: React.FC<DatapointsProps> = ({
  currentTheme,
  currentLanguage,
  project,
  field,
  selectedZone,
  onBack,
  onProjectsChange
}) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
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
      <ProjectHeader
        project={project}
        field={field}
        zone={selectedZone}
        onBack={onBack}
        currentTheme={currentTheme}
      />

      <ZoneSummary
        zone={selectedZone}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
      />

      <DatapointForm
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        parameters={parameters}
        zoneId={selectedZone.id}
        onProjectsChange={onProjectsChange}
      />

      <DatapointList
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        datapoints={selectedZone.datapoints || []}
        parameters={parameters}
        onProjectsChange={onProjectsChange}
      />
    </div>
  );
};

export default Datapoints;