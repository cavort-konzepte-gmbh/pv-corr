import React from 'react';
import { Theme } from '../../../../types/theme';
import { Language } from '../../../../types/language';
import PeoplePanel from '../../../PeoplePanel';

interface PeopleSettingsProps {
  currentTheme: Theme;
  currentLanguage: Language;
}

const PeopleSettings: React.FC<PeopleSettingsProps> = ({
  currentTheme,
  currentLanguage,
}) => {
  return (
    <PeoplePanel
      currentTheme={currentTheme}
      currentLanguage={currentLanguage}
      savedPeople={[]}
      onSavePeople={() => {}}
    />
  );
};

export default PeopleSettings;