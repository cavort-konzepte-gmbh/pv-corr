import React from 'react';
import { Theme } from '../../../../types/theme';
import { Language, LANGUAGES } from '../../../../types/language';

interface GeneralSettingsProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  decimalSeparator: ',' | '.';
  onDecimalSeparatorChange: (separator: ',' | '.') => void;
  showHiddenIds: boolean;
  onShowHiddenIdsChange: (show: boolean) => void;
  currentTheme: Theme;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  currentLanguage,
  onLanguageChange,
  decimalSeparator,
  onDecimalSeparatorChange,
  showHiddenIds,
  onShowHiddenIdsChange,
  currentTheme
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded bg-border">
        <div>
          <span className="text-primary">
            Language
          </span>
          <div className="text-xs text-secondary">
            Choose your preferred language
          </div>
        </div>
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="px-3 py-1 rounded text-sm text-secondary border-theme border-solid bg-transparent"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between p-3 rounded bg-border">
        <div>
          <span className="text-primary">
            Decimal Separator
          </span>
          <div className="text-xs text-secondary">
            Choose the decimal separator for numbers
          </div>
        </div>
        <select
          value={decimalSeparator}
          onChange={(e) => onDecimalSeparatorChange(e.target.value as ',' | '.')}
          className="px-3 py-1 rounded text-sm text-secondary border-theme border-solid bg-transparent"
        >
          <option value=",">Comma (,)</option>
          <option value=".">Point (.)</option>
        </select>
      </div>

      <div className="flex items-center justify-between p-3 rounded bg-border">
        <div>
          <span className="text-primary">
            Show Hidden IDs
          </span>
          <div className="text-xs text-secondary">
            Display 24-digit hex IDs for all items
          </div>
        </div>
        <button
          onClick={() => onShowHiddenIdsChange(!showHiddenIds)}
          className="px-3 py-1 rounded text-sm"
          style={{ 
            backgroundColor: showHiddenIds ? currentTheme.colors.accent.primary : 'transparent',
            color: showHiddenIds ? 'white' : currentTheme.colors.text.secondary,
            border: showHiddenIds ? 'none' : `1px solid ${currentTheme.colors.border}`
          }}
        >
          {showHiddenIds ? 'Enabled' : 'Not enabled'}
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;