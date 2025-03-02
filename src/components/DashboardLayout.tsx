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
import { LogOut, FolderOpen, Grid, Map, Settings as SettingsIcon, Database, LayoutDashboard } from 'lucide-react';
import { ButtonSection } from './ui/ButtonSection';

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
            currentLanguage={currentLanguage}
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
          <div className="p-6 text-center text-secondary">
            {t("datapoint.please_select_zone")}
          </div>
        );
      case 'evaluation':
        return (
          <div className="p-6 text-center text-secondary">
            {t("evaluation.panel_coming_soon")}
          </div>
        );
      case 'output':
        return (
          <div className="p-6 text-center text-secondary">
            {t("output.panel_coming_soon")}
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
                <span>{t("nav.back")}</span>
              </button>
              <div className="h-6 w-px bg-border mx-2" />
              <ButtonSection view={settingsView} match="general" onClick={() => setSettingsView('general')}>
                <span>{t("settings.general")}</span>
              </ButtonSection>
              <ButtonSection view={settingsView} match="theme" onClick={() => setSettingsView('theme')}>
                <span>{t("settings.theme")}</span>
              </ButtonSection>
              <ButtonSection view={settingsView} match="companies" onClick={() => setSettingsView('companies')}>
                <span>{t("settings.companies")}</span>
              </ButtonSection>
              <ButtonSection view={settingsView} match="people" onClick={() => setSettingsView('people')}>
                <span>{t("settings.people")}</span>
              </ButtonSection>
            </>
          ) : (
            <>
              <ButtonSection view={view} match="projects" onClick={() => setView('projects')}>
                <FolderOpen size={18} />
                <span>{t("nav.projects")}</span>
              </ButtonSection>
              <ButtonSection view={view} match="fields" onClick={() => setView('fields')}>
                <Grid size={18} />
                <span>{t("nav.fields")}</span>
              </ButtonSection>         
              <ButtonSection view={view} match="zones" onClick={() => setView('zones')}>
                <Map size={18} />
                <span>{t("nav.zones")}</span>
              </ButtonSection>
              <ButtonSection view={view} match="datapoints" onClick={() => setView('datapoints')}>
                <Database size={18} />
                <span>{t("nav.datapoints")}</span>
              </ButtonSection>
              <ButtonSection view={view} match="evaluation" onClick={() => setView('evaluation')}>
                <Database size={18} />
                <span>{t("nav.evaluation")}</span>
              </ButtonSection>
              <ButtonSection view={view} match="output" onClick={() => setView('output')}>
                <Database size={18} />
                <span>{t("nav.output")}</span>
              </ButtonSection>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {view !== 'settings' && (
            <ButtonSection view={settingsView} match="settinngs" onClick={() => setView('settings')}>
              <SettingsIcon size={18} />
              <span>{t("nav.settings")}</span>
            </ButtonSection>
          )}
          {isAdmin && (
            <ButtonSection view={settingsView} match="admin" onClick={toggleViewMode}>
              <LayoutDashboard size={18} />
              <span>{t("nav.administration")}</span>
            </ButtonSection>
          )}
          <ButtonSection view={settingsView} match="signout" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>{t("nav.signout")}</span>
          </ButtonSection>
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