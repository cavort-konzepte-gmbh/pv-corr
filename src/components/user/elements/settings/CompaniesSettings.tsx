import React from "react";
import { Theme } from "../../../../types/theme";
import { Language } from "../../../../types/language";
import { Company } from "../../../../types/companies";
import { useEffect, useState } from "react";
import CompaniesPanel from "../../../CompaniesPanel";

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
  const [sortedCompanies, setSortedCompanies] = useState<Company[]>([]);

  // Sort companies alphabetically
  useEffect(() => {
    if (savedCompanies && savedCompanies.length > 0) {
      const sorted = [...savedCompanies].sort((a, b) => a.name.localeCompare(b.name));
      setSortedCompanies(sorted);
    } else {
      setSortedCompanies([]);
    }
  }, [savedCompanies]);

  return (
    <CompaniesPanel
      currentTheme={currentTheme}
      currentLanguage={currentLanguage}
      savedPeople={[]}
      savedCompanies={sortedCompanies}
      onSaveCompanies={onSaveCompanies}
      onCreateCustomer={onCreateCustomer}
    />
  );
};

export default CompaniesSettings;
