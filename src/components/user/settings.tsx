import React from 'react';
import { Theme, THEMES } from '../../types/theme';
import { Language } from '../../types/language';
import { Company } from '../../types/companies';
import { Standard } from '../../types/standards';
import GeneralSettings from './elements/settings/GeneralSettings';
import ThemeSettings from './elements/settings/ThemeSettings';
import CompaniesSettings from './elements/settings/CompaniesSettings';
import PeopleSettings from './elements/settings/PeopleSettings';
import DatapointsSettings from './elements/settings/DatapointsSettings';
import { Person } from '../../types/people';

interface SettingsProps {
  view: 'general' | 'theme' | 'people' | 'companies' | 'datapoints' | 'translations';
  onViewChange: (view: 'general' | 'theme' | 'people' | 'companies' | 'datapoints' | 'translations') => void;
  showHiddenIds: boolean;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onShowHiddenIdsChange: (show: boolean) => void;
  decimalSeparator: ',' | '.';
  onDecimalSeparatorChange: (separator: ',' | '.') => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
  standards: Standard[];
  onStandardsChange: (standards: Standard[]) => void;
  savedCompanies: Company[];
  onSaveCompanies: (companies: Company[]) => void;
  savedPeople: Person[];
  onSavePeople: (people: Person[]) => void;
  onCreateCustomer: (...args: any) => void
}

const Settings: React.FC<SettingsProps> = ({
  view,
  onViewChange,
  showHiddenIds,
  currentLanguage,
  onLanguageChange,
  onShowHiddenIdsChange,
  decimalSeparator,
  onDecimalSeparatorChange,
  currentTheme,
  onThemeChange,
  onClose,
  standards,
  onStandardsChange,
  savedCompanies,
  onSaveCompanies,
  savedPeople,
  onSavePeople,
  onCreateCustomer
}) => {
  return (
    <div className="flex-1 p-6 overflow-auto bg-theme">
        {view === 'general' && (
          <GeneralSettings
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
            decimalSeparator={decimalSeparator}
            onDecimalSeparatorChange={onDecimalSeparatorChange}
            showHiddenIds={showHiddenIds}
            onShowHiddenIdsChange={onShowHiddenIdsChange}
            currentTheme={currentTheme}
          />
        )}

        {view === 'theme' && (
          <ThemeSettings
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
            themes={THEMES}
          />
        )}

        {view === 'companies' && (
          <CompaniesSettings
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            savedCompanies={savedCompanies}
            onSaveCompanies={onSaveCompanies} 
            onCreateCustomer={(companyId, name) => onCreateCustomer(companyId, name, 'company')}
          />
        )}

        {view === 'people' && (
          <PeopleSettings
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            savedPeople={savedPeople}
            onSavePeople={onSavePeople}
            onCreateCustomer={(personId, name) => onCreateCustomer(personId, name, 'person')}
          />
        )}

        {view === 'datapoints' && (
          <DatapointsSettings
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            standards={standards}
            onStandardsChange={onStandardsChange}
          />
        )}

        {view === 'translations' && (
          <TranslationsPanel
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
          />
        )}
      </div>
  );
};

export default Settings;