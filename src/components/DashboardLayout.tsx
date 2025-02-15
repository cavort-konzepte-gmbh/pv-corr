import { useState, useEffect } from 'react';
import { Theme, THEMES } from '../types/theme';
import { Language, LANGUAGES, useTranslation } from '../types/language';
import { Project } from '../types/projects';
import { Company } from '../types/companies';
import { fetchProjects } from '../services/projects';
import { useAuth } from './auth/AuthProvider';
import { SavedPlace } from './PlacesPanel';
import { Person } from '../types/people';
import { fetchPeople } from '../services/people';
import { fetchPlaces } from '../services/places';
import ProjectsPanel from './ProjectsPanel';
import FieldsPanel from './FieldsPanel';
import ZonesPanel from './ZonesPanel';
import SettingsPanel from './SettingsPanel';
import { LogOut, FolderOpen, Grid, Map, Settings, Database } from 'lucide-react';
import DatapointsPanel from './DatapointsPanel';
import { fetchCompanies } from '../services/companies';

const DashboardLayout = () => {
  const { signOut } = useAuth();
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
  const [settingsView, setSettingsView] = useState<'general' | 'theme' | 'places' | 'people' | 'projects' | 'sample'>('general');
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation(currentLanguage);
  const { user } = useAuth();

  const handleLanguageChange = (language: Language) => {
    if (!language || !LANGUAGES.find(l => l.id === language)) return;
    setCurrentLanguage(language);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setError(null);
      try {
        setLoading(true);
        const [fetchedProjects, places, people, companies] = await Promise.all([
          fetchProjects(),
          fetchPlaces(),
          fetchPeople(),
          fetchCompanies()
        ]);
        
        if (fetchedProjects) {
          setProjects(fetchedProjects);
        }
        setSavedPlaces(places);
        setSavedPeople(people);
        setCompanies(companies)
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
      const settings = e.detail || {};
      setCurrentLanguage(settings.language);
      setShowHiddenIds(settings.showHiddenIds);
      const theme = THEMES.find(t => t.id === (settings.theme_id || 'ferra'));
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

    switch (view) {
      case 'projects':
        return (
          <ProjectsPanel
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
          <FieldsPanel
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            projects={projects}
            onProjectsChange={setProjects}
            selectedProjectId={selectedProjectId} 
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
          <ZonesPanel
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            projects={projects}
            onProjectsChange={setProjects}
            selectedProjectId={selectedProjectId}
            selectedFieldId={selectedFieldId} 
            onSelectZone={(zoneId) => {
              setSelectedZoneId(zoneId);
              setView('datapoints');
            }}
          />
        );
      case 'datapoints':
        return (
          <DatapointsPanel
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            selectedZone={selectedZone}
            onBack={() => {
              setView('zones');
              setSelectedZoneId(undefined);
            }}
          />
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
          <SettingsPanel
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
            projects={projects}
            onProjectsChange={setProjects}
            savedCompanies={savedCompanies}
            onSaveCompanies={setCompanies}
            standards={[]}
            onStandardsChange={() => {}}
            places={savedPlaces}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Top Navigation Bar */}
      <div 
        className="h-14 border-b flex items-center px-4"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border 
        }}
      >
        <div className="flex-1 flex items-center gap-6">
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
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('settings')}
            className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
            style={{
              backgroundColor: view === 'settings' ? currentTheme.colors.background : 'transparent',
              color: view === 'settings' ? currentTheme.colors.text.primary : currentTheme.colors.text.secondary
            }}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {error && (
          <div 
            className="fixed top-4 right-4 p-4 rounded shadow-lg max-w-md"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              border: `1px solid ${currentTheme.colors.accent.primary}`,
              color: currentTheme.colors.accent.primary
            }}
          >
            {error}
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardLayout;