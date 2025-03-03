import React from 'react';
import { Theme } from '../../../../types/theme';
import { Language } from '../../../../types/language';
import PeoplePanel from '../../../PeoplePanel';
import { Person } from '../../../../types/people';

interface PeopleSettingsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  savedPeople: Person[];
  onSavePeople: (people: Person[]) => void;
  onCreateCustomer?: (personId: string, name: string) => void;
}

const PeopleSettings: React.FC<PeopleSettingsProps> = ({
  currentTheme,
  currentLanguage,
  savedPeople,
  onSavePeople,
  onCreateCustomer
}) => {
  return (
    <PeoplePanel
      currentTheme={currentTheme}
      currentLanguage={currentLanguage}
      savedPeople={savedPeople}
      onSavePeople={onSavePeople}
      onCreateCustomer={onCreateCustomer}
    />
  );
};

export default PeopleSettings;