import React from 'react';
import { Theme } from '../../../../types/theme';
import { Zone } from '../../../../types/projects';
import { MapPin } from 'lucide-react';

interface ZoneSummaryProps {
  zone: Zone;
  currentTheme: Theme;
}

const ZoneSummary: React.FC<ZoneSummaryProps> = ({
  zone,
  currentTheme
}) => {
  return (
    <div className="p-6 rounded-lg mb-8 border-theme border-solid bg-surface">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-medium text-primary">
            Zone Details
          </div>
          <div className="mt-2 text-sm text-secondary">
            {zone.datapoints?.length || 0} datapoints
          </div>
        </div>
        {zone.latitude && zone.longitude && (
          <button
            onClick={() => window.open(`https://www.google.com/maps?q=${zone.latitude},${zone.longitude}`, '_blank')}
            className="flex items-center gap-2 text-sm text-accent-primary"
          >
            <MapPin size={14} />
            View on map
          </button>
        )}
      </div>
    </div>
  );
};

export default ZoneSummary;