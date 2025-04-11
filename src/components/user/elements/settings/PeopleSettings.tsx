import React from "react";
import { Theme } from "../../../../types/theme";
import { Language } from "../../../../types/language";
import PeoplePanel from "../../../PeoplePanel";
import { Person } from "../../../../types/people";
import { useEffect, useState } from "react";

interface PeopleSettingsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  savedPeople: Person[];
  onSavePeople: (people: Person[]) => void;
  onCreateCustomer?: (personId: string, name: string) => void;
}

const PeopleSettings: React.FC<PeopleSettingsProps> = ({ currentTheme, currentLanguage, savedPeople, onSavePeople, onCreateCustomer }) => {
  const [sortedPeople, setSortedPeople] = useState<Person[]>([]);

  // Sort people alphabetically
  useEffect(() => {
    if (savedPeople && savedPeople.length > 0) {
      const sorted = [...savedPeople].sort((a, b) => 
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );
      setSortedPeople(sorted);
    } else {
      setSortedPeople([]);
    }
  }, [savedPeople]);

  return (
    <PeoplePanel
      currentTheme={currentTheme}
      currentLanguage={currentLanguage}
      savedPeople={sortedPeople}
      onSavePeople={onSavePeople}
      onCreateCustomer={onCreateCustomer}
    />
  );
};

export default PeopleSettings;
