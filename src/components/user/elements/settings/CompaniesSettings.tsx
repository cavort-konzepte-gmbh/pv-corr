import React from 'react';
import { Theme } from '../../../../types/theme';
import { Language } from '../../../../types/language';
import { Company } from '../../../../types/companies';
import CompaniesPanel from '../../../CompaniesPanel';

interface CompaniesSettingsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  savedCompanies: Company[];
  onSaveCompanies: (companies: Company[]) => void;
  onCreateCustomer?: (companyId: string, name: string) => void;
}

const CompaniesSettings: React.FC<CompaniesSettingsProps> = ({
  currentTheme,
  currentLanguage,
  savedCompanies,
  onSaveCompanies,
  onCreateCustomer,
}) => {
  return (
    <CompaniesPanel
      currentTheme={currentTheme}
      currentLanguage={currentLanguage}
      savedPeople={[]}
      savedCompanies={savedCompanies}
      onSaveCompanies={onSaveCompanies}
      onCreateCustomer={onCreateCustomer}
    />
  );
};

export default CompaniesSettings;
