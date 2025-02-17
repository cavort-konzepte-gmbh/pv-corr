import React, { useState } from 'react';
import { Theme } from '../../types/theme';
import { Database, Settings, Table, ArrowLeft, Palette } from 'lucide-react';
import DatapointsPanel from '../DatapointsPanel';
import SubstructuresManagement from './SubstructuresManagement';
import ThemeManagement from './ThemeManagement';

interface DatabaseManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

const DatabaseManagement: React.FC<DatabaseManagementProps> = ({ currentTheme, onBack }) => {
  const [activeView, setActiveView] = useState<'overview' | 'datapoints' | 'themes' | 'substructures'>('overview');
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
          onClick={() => setActiveView('datapoints')}
          className="p-6 rounded-lg transition-all hover:translate-y-[-2px] bg-surface"
          style={{ 
            border: `1px solid ${activeView === 'datapoints' ? currentTheme.colors.accent.primary : currentTheme.colors.border}`
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
                Datapoints
              </h3>
              <p className="text-sm text-secondary">
                Manage parameters & standards
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
        {activeView === 'datapoints' && (
          <DatapointsPanel
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
      </div>
    </div>
  );
};

export default DatabaseManagement;