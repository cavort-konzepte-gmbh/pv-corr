import React, { useState } from 'react';
import { Theme } from '../../types/theme';
import { Database, Settings, Table, ArrowLeft, Palette, ClipboardList } from 'lucide-react';
import SubstructuresManagement from './SubstructuresManagement';
import ThemeManagement from './ThemeManagement';
import  {ParameterPanel } from './ParameterPanel';



interface DatabaseManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

const DatabaseManagement: React.FC<DatabaseManagementProps> = ({ currentTheme, onBack }) => {
  const [activeView, setActiveView] = useState<'overview' | 'parameters' | 'themes' | 'substructures' | 'standards'>('overview');
  const [standards, setStandards] = useState([]);

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded hover:bg-opacity-80 text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-primary">
          Database Management
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => setActiveView('overview')}
          className="p-6 rounded-lg transition-all hover:translate-y-[-2px] bg-surface"
          style={{ 
            border: `1px solid ${activeView === 'overview' ? currentTheme.colors.accent.primary : currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Database size={20} style={{ color: currentTheme.colors.accent.primary }} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Overview
              </h3>
              <p className="text-sm text-secondary">
                Database statistics
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('parameters')}
          className="p-6 rounded-lg transition-all hover:translate-y-[-2px] bg-surface"
          style={{ 
            border: `1px solid ${activeView === 'parameters' ? currentTheme.colors.accent.primary : currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Table className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Parameters
              </h3>
              <p className="text-sm text-secondary">
                Manage parameters 
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('standards')}
          className="p-6 rounded-lg transition-all hover:translate-y-[-2px] bg-surface"
          style={{ 
            border: `1px solid ${activeView === 'standards' ? currentTheme.colors.accent.primary : currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <ClipboardList className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Standards
              </h3>
              <p className="text-sm text-secondary">
                Manage standards
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('substructures')}
          className="p-6 rounded-lg transition-all hover:translate-y-[-2px] bg-surface"
          style={{ 
            border: `1px solid ${activeView === 'substructures' ? currentTheme.colors.accent.primary : currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Settings className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Substructures
              </h3>
              <p className="text-sm text-secondary">
                Manage substructure systems
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('themes')}
          className="p-6 rounded-lg transition-all hover:translate-y-[-2px] bg-surface"
          style={{ 
            border: `1px solid ${activeView === 'themes' ? currentTheme.colors.accent.primary : currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Palette className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Themes
              </h3>
              <p className="text-sm text-secondary">
                Manage themes
              </p>
            </div>
          </div>
        </button>

        <button className="p-6 rounded-lg transition-all hover:translate-y-[-2px] border-theme border-solid bg-surface">
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Settings className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Configuration
              </h3>
              <p className="text-sm text-secondary">
                Database settings
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="rounded-lg bg-surface">
        {activeView === 'parameters' && (
          <ParameterPanel
            currentTheme={currentTheme}
            currentLanguage="en"
          />
        )}
        {activeView === 'substructures' && (
          <SubstructuresManagement
            currentTheme={currentTheme}
            onBack={() => setActiveView('overview')}
          />
        )}
        {activeView === 'themes' && (
          <ThemeManagement
            currentTheme={currentTheme}
            onBack={() => setActiveView('overview')}
          />
        )}
        {activeView === 'overview' && (
          <div className="p-6">
            <h3 
              className="text-lg font-medium mb-4"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Database Overview
            </h3>
            {/* Add overview content here */}
          </div>
        )}
        {activeView === 'standards' && (
          <div className="p-6">
            <h3 
              className="text-lg font-medium mb-4"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Standards Management
            </h3>
            {/* Add standards management content here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManagement;