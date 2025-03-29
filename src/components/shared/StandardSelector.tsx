import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { Standard, DEFAULT_STANDARDS } from "../../types/standards";
import { fetchStandards } from "../../services/standards";

interface StandardSelectorProps {
  currentTheme: Theme;
  currentLanguage: Language;
  onStandardsChange: (standards: Standard[]) => void;
}

const StandardSelector: React.FC<StandardSelectorProps> = ({ currentTheme, currentLanguage, onStandardsChange }) => {
  const t = useTranslation(currentLanguage);
  const [standards, setStandards] = useState<Standard[]>(DEFAULT_STANDARDS);

  useEffect(() => {
    const loadStandards = async () => {
      try {
        const fetchedStandards = await fetchStandards();
        if (fetchedStandards?.length > 0) {
          setStandards(fetchedStandards);
          onStandardsChange(fetchedStandards);
        }
      } catch (error) {
        console.error("Error fetching standards:", error);
      }
    };

    loadStandards();
  }, [onStandardsChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg text-primary">{t("standards.all")}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {standards.map((standard) => (
          <div key={standard.id} className="p-4 rounded-lg border transition-all hover:translate-x-1 text-primary border-theme bg-surface">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{standard.name}</div>
              {standard.version && <div className="text-sm text-secondary">v{standard.version}</div>}
            </div>
            {standard.description && <div className="text-sm text-secondary">{standard.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StandardSelector;
