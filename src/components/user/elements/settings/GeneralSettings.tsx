import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Language, LANGUAGES } from '../../../../types/language';
import { useTranslation } from '../../../../types/language';
import { updateUserSettings } from '../../../../services/userSettings';

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
  const t = useTranslation(currentLanguage);
  const [updating, setUpdating] = useState(false);

  const handleSettingChange = async (key: string, value: any) => {
    if (updating) return;
    setUpdating(true);

    try {
      // Update settings through service
      const success = await updateUserSettings({
        [key === 'language' ? 'language' : 
         key === 'decimal_separator' ? 'decimalSeparator' :
         key === 'show_hidden_ids' ? 'showHiddenIds' : key]: value
      });

      if (!success) {
        throw new Error('Failed to update settings');
      }

      // Local state will be updated via userSettingsLoaded event

    } catch (err) {
      console.error('Error updating user setting:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded bg-border">
        <div>
          <span className="text-primary">
            {t('settings.language')}
          </span>
          <div className="text-xs text-secondary">
            {t('settings.language.description')}
          </div>
        </div>
        <select
          value={currentLanguage}
          onChange={(e) => handleSettingChange('language', e.target.value)}
          disabled={updating}
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
            {t('settings.decimal_separator')}
          </span>
          <div className="text-xs text-secondary">
            {t('settings.decimal_separator.description')}
          </div>
        </div>
        <select
          value={decimalSeparator}
          onChange={(e) => handleSettingChange('decimal_separator', e.target.value)}
          disabled={updating}
          className="px-3 py-1 rounded text-sm text-secondary border-theme border-solid bg-transparent"
        >
          <option value=",">{t('settings.decimal_separator.comma')}</option>
          <option value=".">{t('settings.decimal_separator.point')}</option>
        </select>
      </div>

      <div className="flex items-center justify-between p-3 rounded bg-border">
        <div>
          <span className="text-primary">
            {t('settings.hidden_ids')}
          </span>
          <div className="text-xs text-secondary">
            {t('settings.hidden_ids.description')}
          </div>
        </div>
        <button
          onClick={() => handleSettingChange('show_hidden_ids', !showHiddenIds)}
          disabled={updating}
          className="px-3 py-1 rounded text-sm"
          style={{ 
            backgroundColor: showHiddenIds ? currentTheme.colors.accent.primary : 'transparent',
            color: showHiddenIds ? 'white' : currentTheme.colors.text.secondary,
            border: showHiddenIds ? 'none' : `1px solid ${currentTheme.colors.border}`,
            opacity: updating ? 0.5 : 1,
            cursor: updating ? 'not-allowed' : 'pointer'
          }}
        >
          {showHiddenIds ? t('settings.enabled') : t('settings.not_enabled')}
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;