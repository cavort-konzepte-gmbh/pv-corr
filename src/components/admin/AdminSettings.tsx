import React from 'react';
import { Theme } from '../../types/theme';
import { ArrowLeft, Palette, Globe, ChevronLeft } from 'lucide-react';
import ThemeManagement from './ThemeManagement';
import TranslationsPanel from './settings/TranslationsPanel';

interface AdminSettingsProps {
  currentTheme: Theme;
  onBack: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ currentTheme, onBack }) => {
  const [activeView, setActiveView] = React.useState<'overview' | 'themes' | 'translations'>('overview');

  return (
    <div className="p-8">
      {activeView !== 'overview' ? (
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-2 text-secondary"
          >
            <ChevronLeft size={20} />
            <span>System Configuration</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded hover:bg-opacity-80 text-secondary"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-primary">
            System Configuration
          </h2>
        </div>
      )}

      {activeView === 'themes' ? (
        <ThemeManagement
          currentTheme={currentTheme}
          onBack={() => setActiveView('overview')}
        />
      ) : activeView === 'translations' ? (
        <TranslationsPanel
          currentTheme={currentTheme}
          currentLanguage="en"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Theme Management */}
          <div 
            onClick={() => setActiveView('themes')}
            className="p-6 rounded-lg bg-surface hover:bg-opacity-80 transition-colors cursor-pointer"
          >
            <div className="flex flex-col gap-2">
              <Palette className="text-accent-primary" size={24} />
              <h3 className="text-lg font-medium text-primary mt-2">
                Theme Management
              </h3>
              <p className="text-sm text-secondary">
                Manage system themes
              </p>
            </div>
          </div>

          {/* Translations Management */}
          <div 
            onClick={() => setActiveView('translations')}
            className="p-6 rounded-lg bg-surface hover:bg-opacity-80 transition-colors cursor-pointer"
          >
            <div className="flex flex-col gap-2">
              <Globe className="text-accent-primary" size={24} />
              <h3 className="text-lg font-medium text-primary mt-2">
                Translations Management
              </h3>
              <p className="text-sm text-secondary">
                Manage system translations
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;