import React from 'react';
import { Theme } from '../../../../types/theme';

interface ThemeSettingsProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  themes: Theme[];
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  currentTheme,
  onThemeChange,
  themes
}) => {
  return (
    <div className="space-y-4">
      {themes.map(theme => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme)}
          className="w-full p-4 text-primary rounded text-left transition-all duration-200 border-theme border-solid bg-surface hover:translate-x-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{theme.name}</div>
              <div className="text-sm mt-1 text-secondary">
                {theme.id === currentTheme.id && 'Currently active'}
              </div>
            </div>
            {theme.id === currentTheme.id && (
              <div className="w-2 h-2 rounded-full bg-accent-primary" />
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <div 
              className="flex-1 h-1 rounded"
              style={{ backgroundColor: theme.colors.background }}
            />
            <div 
              className="flex-1 h-1 rounded"
              style={{ backgroundColor: theme.colors.surface }}
            />
            <div 
              className="flex-1 h-1 rounded"
              style={{ backgroundColor: theme.colors.border }}
            />
            <div 
              className="flex-1 h-1 rounded"
              style={{ backgroundColor: theme.colors.accent.primary }}
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default ThemeSettings;