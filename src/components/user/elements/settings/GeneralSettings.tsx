import React, { useState } from 'react';
import { Language, LANGUAGES } from '../../../../types/language';
import { useTranslation } from '../../../../types/language';
import { updateUserSettings } from '../../../../services/userSettings';
import { Button } from '@/components/ui/button';

interface GeneralSettingsProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  decimalSeparator: ',' | '.';
  onDecimalSeparatorChange: (separator: ',' | '.') => void;
  showHiddenIds: boolean;
  onShowHiddenIdsChange: (show: boolean) => void;
  currentTheme: any;
  onThemeChange: (theme: string) => void
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  currentLanguage,
  onLanguageChange,
  decimalSeparator,
  onDecimalSeparatorChange,
  showHiddenIds,
  onShowHiddenIdsChange,
  currentTheme,
  onThemeChange
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

  const handleChangeTheme = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange(event.target.value)
    handleSettingChange("theme_id", event.target.value)
  }

  return (
    <div className="text-card-foreground space-y-4">
      <div className="flex items-center justify-between p-3 rounded">
        <div>
          <span className="text-3xl font-semibold leading-none">
            {t('settings.language')}
          </span>
          <div className="text-muted-foreground">
            {t('settings.language.description')}
          </div>
        </div>
        <select
          value={currentLanguage}
          onChange={(e) => handleSettingChange('language', e.target.value)}
          disabled={updating}
          className="px-3 py-1 rounded font-medium text-sm text-primary border border-input shadow-sm bg-accent"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between p-3 rounded">
        <div>
          <span className="text-3xl font-semibold leading-none">
            {t('settings.decimal_separator')}
          </span>
          <div className="text-muted-foreground">
            {t('settings.decimal_separator.description')}
          </div>
        </div>
        <select
          value={decimalSeparator}
          onChange={(e) => handleSettingChange('decimal_separator', e.target.value)}
          disabled={updating}
          className="px-3 py-1 rounded font-medium text-sm text-primary border border-input shadow-sm bg-accent"
        >
          <option value=",">{t('settings.decimal_separator.comma')}</option>
          <option value=".">{t('settings.decimal_separator.point')}</option>
        </select>
      </div>

      <div className="flex items-center justify-between p-3 rounded">
        <div>
          <span className="text-3xl font-semibold leading-none">
            {t('settings.hidden_ids')}
          </span>
          <div className="text-muted-foreground">
            {t('settings.hidden_ids.description')}
          </div>
        </div>
        <Button
          onClick={() => handleSettingChange('show_hidden_ids', !showHiddenIds)}
          disabled={updating}
          className="px-3 py-1 rounded text-sm text-primary-foreground hover:cursor-pointer data-[hidden='true']:text-accent-foreground data-[hidden='true']:bg-secondary data-[updating='true']:opacity-50 data-[updating='true']:hover:cursor-not-allowed"
          data-hidden={showHiddenIds}
          data-updating={updating}          
        >
          {showHiddenIds ? t('settings.enabled') : t('settings.not_enabled')}
        </Button>
      </div>
      <div className="p-3 flex items-center justify-between rounded">
        <div>
          <span className="text-3xl font-semibold leading-none">Theme</span>
          <span  className="block text-muted-foreground">Select the theme</span>
        </div>
        <select
          onChange={handleChangeTheme}
          disabled={updating}
          className="px-3 py-1 rounded font-medium text-sm text-primary border border-input shadow-sm bg-accent"
          value={currentTheme}
        >
          <option value="zinc">Zinc Light</option>
          <option value="zinc.dark">Zinc Dark</option>
          <option value="green">Green Light</option>
          <option value="green.dark">Green Dark</option>
        </select>
      </div>
      <div className="p-3 text-primary-foreground bg-primary">
        <span>Theme</span>
        <span className="text-xs">Select the theme</span>
      </div>
    </div>
  );
};

export default GeneralSettings;