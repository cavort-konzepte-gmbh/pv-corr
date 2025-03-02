import React from 'react';
import { Theme } from '../../../../types/theme';
import { Zone } from '../../../../types/projects';
import { MapPin } from 'lucide-react';
import { Language, useTranslation } from '../../../../types/language';

interface ZoneSummaryProps {
  zone: Zone;
  currentTheme: Theme;
  currentLanguage: Language;
}

const ZoneSummary: React.FC<ZoneSummaryProps> = ({
  zone,
  currentTheme,
  currentLanguage,
}) => {
  const translation = useTranslation(currentLanguage);

  return (
    <div className="p-6 rounded-lg mb-8 border-theme border-solid bg-surface">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-medium text-primary">
            {translation("datapoint.zone_details")}
          </div>
          <div className="mt-2 text-sm text-secondary">
            {zone.datapoints?.length || 0} {translation("datapoints").toLowerCase()}
          </div>
        </div>
        {zone.latitude && zone.longitude && (
          <button
            onClick={() => window.open(`https://www.google.com/maps?q=${zone.latitude},${zone.longitude}`, '_blank')}
            className="flex items-center gap-2 text-sm text-accent-primary"
          >
            <MapPin size={14} />
            {translation("general.view_on_map")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ZoneSummary;