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
import { Language } from '../../types/language';
import { Button } from '../ui/button';

interface DatabaseManagementProps {
  currentTheme: Theme;
  onBack: () => void;
  currentLanguage: Language;
}

const DatabaseManagement: React.FC<DatabaseManagementProps> = ({ currentTheme, onBack, currentLanguage }) => {
  const [activeView, setActiveView] = useState<
    'overview' | 'parameters' | 'substructures' | 'norms' | 'constants' | 'materials' | 'foundations' | 'neighboring' | 'experts' | 'norms'
  >('overview');
  const [standards, setStandards] = useState([]);

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="text-primary" size={20} />
        </Button>
        <h2 className="text-2xl font-bold text-primary">Database Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button onClick={() => setActiveView('overview')} className="p-6 rounded-lg border border-accent text-card-foreground bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Database size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Overview</h3>
              <p className="text-sm text-muted-foreground">Database statistics</p>
            </div>
          </div>
        </button>

        <button onClick={() => setActiveView('parameters')} className="p-6 rounded-lg border border-accent text-card-foreground bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Table size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Parameters</h3>
              <p className="text-sm text-muted-foreground">Manage parameters</p>
            </div>
          </div>
        </button>

        <button onClick={() => setActiveView('norms')} className="p-6 rounded-lg border border-accent text-card-foreground bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Norms</h3>
              <p className="text-sm text-muted-foreground">Manage norms</p>
            </div>
          </div>
        </button>

        <button onClick={() => setActiveView('constants')} className="p-6 rounded-lg border border-accent text-card-foreground bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Ruler size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Physical Constants</h3>
              <p className="text-sm text-muted-foreground">Manage physical constants</p>
            </div>
          </div>
        </button>

        <button onClick={() => setActiveView('materials')} className="p-6 rounded-lg border border-accent text-card-foreground bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Flask size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Materials</h3>
              <p className="text-sm text-muted-foreground">Manage materials</p>
            </div>
          </div>
        </button>

        <button onClick={() => setActiveView('foundations')} className="p-6 rounded-lg border border-accent text-card-foreground bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Foundations</h3>
              <p className="text-sm text-muted-foreground">Manage foundations</p>
            </div>
          </div>
        </button>

        <button onClick={() => setActiveView('experts')} className="p-6 rounded-lg border border-accent text-accent-foreground bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Experts</h3>
              <p className="text-sm text-muted-foreground">Manage experts</p>
            </div>
          </div>
        </button>

        <button onClick={() => setActiveView('neighboring')} className="p-6 rounded-lg border border-accent text-accent-foreground bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Neighboring Structures</h3>
              <p className="text-sm text-muted-foreground">Manage neighboring structures</p>
            </div>
          </div>
        </button>

        <button onClick={() => setActiveView('substructures')} className="p-6 rounded-lg border border-accent text-card-foreground bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Wrench size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Substructures</h3>
              <p className="text-sm text-muted-foreground">Manage substructure systems</p>
            </div>
          </div>
        </button>
      </div>

      <div className="rounded-lg text-card-foreground border border-accent bg-card">
        {activeView === 'parameters' && <ParameterPanel currentTheme={currentTheme} currentLanguage={currentLanguage} />}
        {activeView === 'substructures' && <SubstructuresManagement currentTheme={currentTheme} onBack={() => setActiveView('overview')} />}
        {activeView === 'overview' && (
          <div className="p-6">
            <DatabaseOverview currentTheme={currentTheme} />
          </div>
        )}
        {activeView === 'norms' && (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Norms Management</h3>
            {/* Add norms management content here */}
          </div>
        )}
        {activeView === 'constants' && (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Physical Constants Management</h3>
            {/* Add physical constants management content here */}
          </div>
        )}
        {activeView === 'materials' && <MaterialsPanel currentTheme={currentTheme} currentLanguage={currentLanguage} />}
        {activeView === 'norms' && <NormsPanel currentTheme={currentTheme} currentLanguage={currentLanguage} />}
        {activeView === 'experts' && <ExpertsManagement currentTheme={currentTheme} onBack={() => setActiveView('overview')} />}
        {activeView === 'foundations' && <FoundationsManagement currentTheme={currentTheme} onBack={() => setActiveView('overview')} />}
        {activeView === 'neighboring' && (
          <NeighboringStructuresManagement currentTheme={currentTheme} onBack={() => setActiveView('overview')} />
        )}
        {activeView === 'foundations' && (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Foundations Management</h3>
            {/* Add foundations management content here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManagement;
