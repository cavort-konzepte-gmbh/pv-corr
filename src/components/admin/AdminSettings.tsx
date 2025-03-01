import React from 'react';
import { Theme } from '../../types/theme';
import { ArrowLeft, Palette } from 'lucide-react';
import ThemeManagement from './ThemeManagement';

interface AdminSettingsProps {
  currentTheme: Theme;
  onBack: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ currentTheme, onBack }) => {
  const [activeView, setActiveView] = React.useState<'overview' | 'themes'>('overview');

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded hover:bg-opacity-80"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 
          className="text-2xl font-bold"
          style={{ color: currentTheme.colors.text.primary }}
        >
          System Configuration
        </h2>
      </div>

      {activeView === 'themes' ? (
        <ThemeManagement
          currentTheme={currentTheme}
          onBack={() => setActiveView('overview')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Theme Management */}
          <div 
            onClick={() => setActiveView('themes')}
            className="p-6 rounded-lg bg-surface"
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Palette className="text-accent-primary" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-primary">
                  Theme Management
                </h3>
                <p className="text-sm text-secondary">
                  Manage system themes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;