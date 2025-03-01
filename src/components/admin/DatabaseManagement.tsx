import React, { useState } from 'react';
import { Theme } from '../../types/theme';
import { Database, Table, ArrowLeft, ClipboardList, Wrench, Ruler, FlaskRound as Flask, Building2, GraduationCap } from 'lucide-react';
import SubstructuresManagement from './SubstructuresManagement';
import NeighboringStructuresManagement from './NeighboringStructuresManagement';
import FoundationsManagement from './FoundationsManagement';
import ExpertsManagement from './ExpertsManagement';
import { ParameterPanel } from './ParameterPanel';
import { MaterialsPanel } from './MaterialsPanel';
import { NormsPanel } from './NormsPanel';
import DatabaseOverview from './DatabaseOverview';



interface DatabaseManagementProps {
  currentTheme: Theme;
  onBack: () => void;
  currentLanguage: Language;
}

const DatabaseManagement: React.FC<DatabaseManagementProps> = ({ currentTheme, onBack, currentLanguage }) => {
  const [activeView, setActiveView] = useState<'overview' | 'parameters' | 'substructures' | 'norms' | 'constants' | 'materials' | 'foundations' | 'neighboring' | 'experts' | 'norms'>('overview');
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
          className="p-6 rounded-lg bg-surface"
          style={{ 
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Database className="text-accent-primary" size={20} />
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
          className="p-6 rounded-lg bg-surface"
          style={{ 
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
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
          onClick={() => setActiveView('norms')}
          className="p-6 rounded-lg bg-surface"
          style={{ 
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <ClipboardList className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Norms
              </h3>
              <p className="text-sm text-secondary">
                Manage norms
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('constants')}
          className="p-6 rounded-lg bg-surface"
          style={{ 
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Ruler className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Physical Constants
              </h3>
              <p className="text-sm text-secondary">
                Manage physical constants
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('materials')}
          className="p-6 rounded-lg bg-surface"
          style={{ 
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Flask className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Materials
              </h3>
              <p className="text-sm text-secondary">
                Manage materials
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('foundations')}
          className="p-6 rounded-lg bg-surface"
          style={{ 
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Building2 className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Foundations
              </h3>
              <p className="text-sm text-secondary">
                Manage foundations
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('experts')}
          className="p-6 rounded-lg bg-surface"
          style={{ 
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <GraduationCap className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Experts
              </h3>
              <p className="text-sm text-secondary">
                Manage experts
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('neighboring')}
          className="p-6 rounded-lg bg-surface"
          style={{ 
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Building2 className="text-accent-primary" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-primary">
                Neighboring Structures
              </h3>
              <p className="text-sm text-secondary">
                Manage neighboring structures
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('substructures')}
          className="p-6 rounded-lg bg-surface"
          style={{ 
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
            >
              <Wrench className="text-accent-primary" size={20} />
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
      </div>

      <div className="rounded-lg bg-surface">
        {activeView === 'parameters' && (
          <ParameterPanel
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
          />
        )}
        {activeView === 'substructures' && (
          <SubstructuresManagement
            currentTheme={currentTheme}
            onBack={() => setActiveView('overview')}
          />
        )}
        {activeView === 'overview' && (
          <div className="p-6">
            <DatabaseOverview currentTheme={currentTheme} />
          </div>
        )}
        {activeView === 'norms' && (
          <div className="p-6">
            <h3 
              className="text-lg font-medium mb-4"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Norms Management
            </h3>
            {/* Add norms management content here */}
          </div>
        )}
        {activeView === 'constants' && (
          <div className="p-6">
            <h3 
              className="text-lg font-medium mb-4"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Physical Constants Management
            </h3>
            {/* Add physical constants management content here */}
          </div>
        )}
        {activeView === 'materials' && (
          <MaterialsPanel
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
          />
        )}
        {activeView === 'norms' && (
          <NormsPanel
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
          />
        )}
        {activeView === 'experts' && (
          <ExpertsManagement
            currentTheme={currentTheme}
            onBack={() => setActiveView('overview')}
          />
        )}
        {activeView === 'foundations' && (
          <FoundationsManagement
            currentTheme={currentTheme}
            onBack={() => setActiveView('overview')}
          />
        )}
        {activeView === 'neighboring' && (
          <NeighboringStructuresManagement
            currentTheme={currentTheme}
            onBack={() => setActiveView('overview')}
          />
        )}
        {activeView === 'foundations' && (
          <div className="p-6">
            <h3 
              className="text-lg font-medium mb-4"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Foundations Management
            </h3>
            {/* Add foundations management content here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManagement;