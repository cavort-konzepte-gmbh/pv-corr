import React, { useState, useEffect } from 'react';
import { Theme, THEMES } from '../types/theme';
import { Language, LANGUAGES, useTranslation } from '../types/language';
import { Project, Zone } from '../types/projects';
import { Company } from '../types/companies';
import { Standard, STANDARDS } from '../types/standards';
import { fetchProjects } from '../services/projects';
import { useAuth } from './auth/AuthProvider';
import { ArrowLeft } from 'lucide-react';
import { SavedPlace } from './shared/types';
import { Person } from '../types/people';
import { fetchPeople } from '../services/people';
import { fetchCompanies } from '../services/companies';
import Projects from './user/projects';
import Fields from './user/fields';
import Zones from './user/zones';
import Datapoints from './user/datapoints';
import Settings from './user/settings';
import { useKeyAction } from '../hooks/useKeyAction';
import { LogOut, FolderOpen, Grid, Map, Settings as SettingsIcon, Database, LayoutDashboard } from 'lucide-react';

const DashboardLayout = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [savedPeople, setSavedPeople] = useState<Person[]>([]);
  const [showHiddenIds, setShowHiddenIds] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [savedCompanies, setCompanies] = useState<Company[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES.find(theme => theme.id === 'ferra') || THEMES[0]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'projects' | 'fields' | 'zones' | 'datapoints' | 'evaluation' | 'output' | 'settings'>('projects');
  const [settingsView, setSettingsView] = useState<'general' | 'theme' | 'companies' | 'people' | 'datapoints'>('general');
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>();
  const [selectedZone, setSelectedZone] = useState<Zone | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [standards, setStandards] = useState<Standard[]>(STANDARDS);
  const t = useTranslation(currentLanguage);
  const { user, signOut: handleSignOut, isAdmin, toggleViewMode } = useAuth();

  const handleLanguageChange = (language: Language) => {
    if (!language || !LANGUAGES.find(l => l.id === language)) return;
    setCurrentLanguage(language);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setError(null);
      try {
        setLoading(true);
        const [fetchedProjects, people, companies] = await Promise.all([
          fetchProjects(),
          fetchPeople(),
          fetchCompanies()
        ]);
        
        if (fetchedProjects) {
          setProjects(fetchedProjects);
        }
        setSavedPeople(people);
        setCompanies(companies);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadInitialData();
    }
  }, [user]);

  useEffect(() => {
    // Listen for user settings loaded event
    const handleUserSettings = (e: CustomEvent) => {
      const metadata = e.detail || {};
      
      // Update language if set in metadata
      if (metadata.language && LANGUAGES.find(l => l.id === metadata.language)) {
        setCurrentLanguage(metadata.language);
      }
      
      // Update hidden IDs preference
      setShowHiddenIds(!!metadata.show_hidden_ids);
      
      // Update theme
      const theme = THEMES.find(t => t.id === (metadata.theme_id || 'ferra'));
      if (theme) {
        setCurrentTheme(theme);
        document.documentElement.setAttribute('data-theme', theme.id);
      }
    };

    window.addEventListener('userSettingsLoaded', handleUserSettings as EventListener);
    return () => {
      window.removeEventListener('userSettingsLoaded', handleUserSettings as EventListener);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme.id);
  }, [currentTheme]);

  const renderContent = () => {
    const selectedProject = selectedProjectId 
      ? projects.find(p => p.id === selectedProjectId) 
      : null;

    const selectedField = selectedProject && selectedFieldId
      ? selectedProject.fields.find(f => f.id === selectedFieldId)
      : null;

    const selectedZone = selectedField && selectedZoneId
      ? selectedField.zones.find(z => z.id === selectedZoneId)
      : null;

    // Get manager and company info for project
    const manager = selectedProject?.managerId 
      ? savedPeople.find(p => p.id === selectedProject.managerId)
      : null;
      
    const company = selectedProject?.companyId
      ? savedCompanies.find(c => c.id === selectedProject.companyId)
      : null;

    // Prepare project data with manager and company info
    const projectData = selectedProject ? {
      ...selectedProject,
      managerName: manager ? `${manager.firstName} ${manager.lastName}` : undefined,
      managerEmail: manager?.email,
      managerPhone: manager?.phone,
      companyName: company?.name
    } : undefined;

    // Prepare field data
    const fieldData = selectedField ? {
      name: selectedField.name,
      latitude: selectedField.latitude,
      longitude: selectedField.longitude
    } : undefined;
    switch (view) {
      case 'projects':
        return (
          <Projects
            currentTheme={currentTheme}
            savedPlaces={savedPlaces}
            savedPeople={savedPeople}
            savedCompanies={savedCompanies}
            projects={projects}
            onSelectProject={(projectId) => {
              setView('fields');
              setSelectedProjectId(projectId);
            }}
          />
        );
      case 'fields':
        return (
          <Fields
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            projects={projects}
            onProjectsChange={setProjects}
            selectedProjectId={selectedProjectId} 
            selectedField={selectedFieldId}
            onSelectField={(projectId, fieldId) => {
              setView('zones');
              setSelectedProjectId(projectId);
              setSelectedFieldId(fieldId);
            }}
            people={savedPeople}
            companies={savedCompanies}
          />
        );
      case 'zones':
        return (
          <Zones
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            projects={projects}
            onProjectsChange={setProjects}
            selectedProjectId={selectedProjectId}
            selectedFieldId={selectedFieldId} 
            onSelectZone={(zoneId) => {
              // Find the selected zone
              const zone = selectedField?.zones.find(z => z.id === zoneId);
              if (zone) {
                setSelectedZone(zone);
                setSelectedZoneId(zoneId);
                setView('datapoints');
              }
            }}
            people={savedPeople}
            companies={savedCompanies}
          />
        );
      case 'datapoints':
        return selectedZone && selectedProject && selectedField ? (
          <Datapoints
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            project={projectData}
            field={fieldData}
            selectedZone={selectedZone}
            onBack={() => {
              setView('zones');
              setSelectedZoneId(undefined);
              setSelectedZone(undefined);
            }}
            onProjectsChange={setProjects}
          />
        ) : (
          <div className="p-6 text-center" style={{ color: currentTheme.colors.text.secondary }}>
            Please select a zone to view its datapoints
          </div>
        );
      case 'evaluation':
        return (
          <div className="p-6 text-center" style={{ color: currentTheme.colors.text.secondary }}>
            Evaluation panel coming soon
          </div>
        );
      case 'output':
        return (
          <div className="p-6 text-center" style={{ color: currentTheme.colors.text.secondary }}>
            Output panel coming soon
          </div>
        );
      case 'settings':
        return (
          <Settings
            view={settingsView}
            onViewChange={setSettingsView}
            decimalSeparator={','}
            onDecimalSeparatorChange={() => {}}
            showHiddenIds={showHiddenIds}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            onShowHiddenIdsChange={setShowHiddenIds}
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            onClose={() => setView('projects')}
            savedCompanies={savedCompanies}
            onSaveCompanies={setCompanies}
            savedPeople={savedPeople}
            onSavePeople={setSavedPeople}
            standards={standards}
            onStandardsChange={setStandards} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-theme">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b flex items-center px-4 border-theme bg-surface">
        <div className="flex-1 flex items-center gap-6">
          {view === 'settings' ? (
            <>
              <button
                onClick={() => setView('projects')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors text-secondary"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-border mx-2" />
              <button
                onClick={() => setSettingsView('general')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: settingsView === 'general' ? currentTheme.colors.background : 'transparent',
                  color: settingsView === 'general' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <span>General</span>
              </button>
              <button
                onClick={() => setSettingsView('theme')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: settingsView === 'theme' ? currentTheme.colors.background : 'transparent',
                  color: settingsView === 'theme' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <span>Theme</span>
              </button>
              <button
                onClick={() => setSettingsView('companies')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: settingsView === 'companies' ? currentTheme.colors.background : 'transparent',
                  color: settingsView === 'companies' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <span>Companies</span>
              </button>
              <button
                onClick={() => setSettingsView('people')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: settingsView === 'people' ? currentTheme.colors.background : 'transparent',
                  color: settingsView === 'people' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <span>People</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setView('projects')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: view === 'projects' ? currentTheme.colors.background : 'transparent',
                  color: view === 'projects' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <FolderOpen size={18} />
                <span>Projects</span>
              </button>
              <button
                onClick={() => setView('fields')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: view === 'fields' ? currentTheme.colors.background : 'transparent',
                  color: view === 'fields' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <Grid size={18} />
                <span>Fields</span>
              </button>
              <button
                onClick={() => setView('zones')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: view === 'zones' ? currentTheme.colors.background : 'transparent',
                  color: view === 'zones' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <Map size={18} />
                <span>Zones</span>
              </button>
              <button
                onClick={() => setView('datapoints')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: view === 'datapoints' ? currentTheme.colors.background : 'transparent',
                  color: view === 'datapoints' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <Database size={18} />
                <span>Datapoints</span>
              </button>
              <button
                onClick={() => setView('evaluation')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: view === 'evaluation' ? currentTheme.colors.background : 'transparent',
                  color: view === 'evaluation' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <Database size={18} />
                <span>Evaluation</span>
              </button>
              <button
                onClick={() => setView('output')}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: view === 'output' ? currentTheme.colors.background : 'transparent',
                  color: view === 'output' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
                }}
              >
                <Database size={18} />
                <span>Output</span>
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {view !== 'settings' && (
            <button
              onClick={() => setView('settings')}
              className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
              style={{
                backgroundColor: view === 'settings' ? currentTheme.colors.background : 'transparent',
                color: view === 'settings' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
              }}
            >
              <SettingsIcon size={18} />
              <span>Settings</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-2 px-3 py-2 rounded transition-colors text-secondary"
            >
              <LayoutDashboard size={18} />
              <span>Administration</span>
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded transition-colors text-secondary"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {error && (
          <div className="fixed top-4 right-4 p-4 rounded shadow-lg max-w-md text-accent-primary border-accent-primary border-solid bg-surface">
            {error}
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardLayout;