import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Language } from '../../types/language';
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
}

const Datapoints: React.FC<DatapointsProps> = ({
  currentTheme,
  currentLanguage,
  project,
  field,
  selectedZone,
  onBack,
}) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="p-6 text-center" style={{ color: currentTheme.colors.text.secondary }}>
        Please select a zone to view its datapoints
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center" style={{ color: currentTheme.colors.text.secondary }}>
        Loading parameters...
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
      />

      <DatapointForm
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        parameters={parameters}
        zoneId={selectedZone.id}
      />

      <DatapointList
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        datapoints={selectedZone.datapoints || []}
        parameters={parameters}
      />
    </div>
  );
};

export default Datapoints;