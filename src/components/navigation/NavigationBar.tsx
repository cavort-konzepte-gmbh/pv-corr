import React from 'react';
import { Theme } from '../../types/theme';
import { Home, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useTranslation, Language } from '../../types/language';

interface NavigationBarProps {
  view: 'projects' | 'settings';
  currentTheme: Theme;
  currentLanguage: Language;
  onSignOut: () => void;
  onViewChange: (view: 'projects' | 'settings') => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  view,
  currentTheme,
  currentLanguage,
  onSignOut,
  onViewChange
}) => {
  const t = useTranslation(currentLanguage);
  const { isAdmin, loginType } = useAuth();

  return (
    <div className="w-12 border-r flex flex-col items-center py-4 border-theme border-solid bg-surface">
      <div className="flex-1 flex flex-col items-center space-y-2">
        <button
          onClick={() => onViewChange('projects')}
          className={`p-2 rounded transition-colors ${
            view === 'projects' ? 'bg-opacity-10' : ''
          }`}
          title={t('nav.projects')}
          style={{
            backgroundColor: view === 'projects' ? currentTheme.colors.background : 'transparent',
            color: view === 'projects' ? 'white' : currentTheme.colors.text.secondary
          }}
        >
          <Home size={20} />
        </button>
      </div>
      <div className="mt-auto">
        <button
          onClick={onSignOut}
          className="p-2 rounded transition-colors mb-2 text-secondary bg-transparent"
          title={t('nav.sign_out')}          
        >
          <LogOut size={20} />
        </button>
        <button
          onClick={() => onViewChange('settings')}
          className={`p-2 rounded transition-colors ${
            view === 'settings' ? 'bg-opacity-20' : ''
          }`}
          title={t('nav.settings')}
          style={{
            backgroundColor: view === 'settings' ? currentTheme.colors.background : 'transparent',
            color: view === 'settings' ? currentTheme.colors.accent.primary : currentTheme.colors.text.secondary
          }}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default NavigationBar;