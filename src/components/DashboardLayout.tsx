import React, { useState, useEffect } from 'react';
import { Theme, THEMES } from '../types/theme';
import { Language, LANGUAGES, useTranslation } from '../types/language';
import { BrowserRouter as Router } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateHiddenId } from '../utils/generateHiddenId';
import { Project, Zone } from '../types/projects';
import { Company } from '../types/companies';
import { Customer } from '../types/customers';
import { Standard, STANDARDS } from '../types/standards';
import { fetchProjects } from '../services/projects';
import { fetchCustomers } from '../services/customers';
import { useAuth } from './auth/AuthProvider';
import { ArrowLeft } from 'lucide-react';
import { SavedPlace } from './shared/types';
import { Person } from '../types/people';
import { fetchPeople } from '../services/people';
import { fetchCompanies } from '../services/companies';
import Customers from './user/customers';
import Projects from './user/projects';
import Fields from './user/fields';
import Zones from './user/zones';
import Datapoints from './user/datapoints';
import Settings from './user/settings';
import AnalysisPanel from './analysis/AnalysisPanel';
import { LogOut, FolderOpen, Grid, Map, Settings as SettingsIcon, Database, LayoutDashboard, Building2 } from 'lucide-react';
import { FileText } from 'lucide-react';
import { ButtonSection } from './ui/ButtonSection';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { updateUserSettings } from '@/services/userSettings';

const DashboardLayout = () => {
  const {
    view,
    selectedProjectId,
    selectedFieldId,
    selectedZoneId,
    selectedCustomerId,
    setView,
    setSelectedProjectId,
    setSelectedFieldId,
    setSelectedZoneId,
    setSelectedCustomerId,
    resetNavigation
  } = useAppNavigation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [savedPeople, setSavedPeople] = useState<Person[]>([]);
  const [showHiddenIds, setShowHiddenIds] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [savedCompanies, setCompanies] = useState<Company[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES.find(theme => theme.id === 'ferra') || THEMES[0]);
  const [loading, setLoading] = useState(true);
  const [settingsView, setSettingsView] = useState<'general' | 'theme' | 'companies' | 'people' | 'datapoints'>('general');
  const [selectedZone, setSelectedZone] = useState<Zone | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [standards, setStandards] = useState<Standard[]>(STANDARDS);
  const t = useTranslation(currentLanguage);

  const handleCreateCustomer = async (id: string, name: string, type: 'person' | 'company') => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name,
          hidden_id: generateHiddenId(),
          person_id: type === 'person' ? id : null,
          company_id: type === 'company' ? id : null
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh customers list
      const updatedCustomers = await fetchCustomers();
      setCustomers(updatedCustomers);

      // Show success message
      setError(`Successfully created customer: ${name}`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error creating customer:', err);
      setError('Failed to create customer');
    }
  };

  const handleMoveProject = async (projectId: string, newCustomerId: string | null) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ customer_id: newCustomerId })
        .eq('id', projectId);

      if (error) throw error;
      // Refresh projects list
      const updatedProjects = await fetchProjects(selectedCustomerId);

      setProjects(updatedProjects);

      setError('Project moved successfully');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error moving project:', err);
      setError('Failed to move project');
    }
  };

  const handleLanguageChange = (language: Language) => {
    if (!language || !LANGUAGES.find(l => l.id === language)) return;
    setCurrentLanguage(language);
  };

  const { user, signOut: handleSignOut, isAdmin, toggleViewMode } = useAuth();

  useEffect(() => {
    const loadInitialData = async () => {
      setError(null);
      try {
        setLoading(true);
        // Load initial data
        const [people, companies, fetchedCustomers] = await Promise.all([
          fetchPeople(),
          fetchCompanies(),
          fetchCustomers()
        ]);
        
        setSavedPeople(people);
        setCompanies(companies);
        setCustomers(fetchedCustomers);

        // Load uncategorized projects
        const uncategorizedProjects = await fetchProjects();
        setProjects(uncategorizedProjects);
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
      const theme = THEMES.find(t => t === (metadata.theme_id || 'zinc'));
      if (theme) {
        setCurrentTheme(theme);
      }
    };

    window.addEventListener('userSettingsLoaded', handleUserSettings as EventListener);
    return () => {
      window.removeEventListener('userSettingsLoaded', handleUserSettings as EventListener);
    };
  }, []);

  const handleUpdateTheme = async (theme: Theme) => {
    const split = theme.split(".")
    document.documentElement.setAttribute('data-theme', split[0]);
    if(split[1]) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    setCurrentTheme(theme)
  }

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
      case 'customers':
        return (
          <Customers
            currentTheme={currentTheme}
            customers={customers}
            savedPeople={savedPeople}
            savedCompanies={savedCompanies}
            onSelectCustomer={(customerId) => {
              setSelectedCustomerId(customerId);
              setView('projects');
              setSelectedProjectId(undefined);
              setSelectedFieldId(undefined);
              setSelectedZoneId(undefined);
              // Load projects for selected customer
              const loadCustomerProjects = async () => {
                try {
                  const customerProjects = await fetchProjects(customerId);
                  setProjects(customerProjects);
                } catch (err) {
                  console.error('Error loading customer projects:', err);
                  setError('Failed to load customer projects');
                }
              };
              loadCustomerProjects();
            }}
            onSelectUncategorized={() => {
              setSelectedCustomerId(null);
              setView('projects');
              setSelectedProjectId(undefined);
              setSelectedFieldId(undefined);
              setSelectedZoneId(undefined);
              const loadUncategorizedProjects = async () => {
                try {
                  const projects = await fetchProjects(null);
                  setProjects(projects);
                } catch (err) {
                  console.error('Error loading uncategorized projects:', err);
                  setError('Failed to load uncategorized projects');
                }
              };
              loadUncategorizedProjects();
            }}
          />
        );
      case 'projects':
        return (
          <Projects
            currentTheme={currentTheme}
            savedPlaces={savedPlaces}
            savedPeople={savedPeople}
            savedCompanies={savedCompanies}
            projects={projects}
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onMoveProject={handleMoveProject}
            onSelectProject={(projectId) => {
              setView('fields');
              setSelectedProjectId(projectId);
              setSelectedFieldId(undefined);
              setSelectedZoneId(undefined);
            }}
            currentLanguage={currentLanguage}
            onProjectsChange={setProjects}
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
              setSelectedZoneId(undefined);
            }}
            people={savedPeople}
            companies={savedCompanies}
            selectedCustomerId={selectedCustomerId} 
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
            selectedCustomerId={selectedCustomerId}
          />
        ) : (
          <div className="p-6 text-center" >
            {t("datapoint.please_select_zone")}
          </div>
        );
      case 'analyse':
        return (
          <AnalysisPanel
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            projects={projects}
            standards={standards}
            selectedProjectId={selectedProjectId}
            selectedFieldId={selectedFieldId}
            selectedZoneId={selectedZoneId}
            onBack={() => setView('projects')}
          />
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
            onThemeChange={handleUpdateTheme}
            onClose={() => setView('projects')}
            savedCompanies={savedCompanies}
            onSaveCompanies={setCompanies}
            savedPeople={savedPeople}
            onSavePeople={setSavedPeople}
            onCreateCustomer={handleCreateCustomer}
            standards={standards}
            onStandardsChange={setStandards}
           />
        );
      default:
        return null;
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <div className="h-14 border-b flex items-center px-4 border-input">
          <div className="flex-1 flex items-center gap-6">
            {view === 'settings' ? (
              <>
                <button
                  onClick={() => setView('projects')}
                  className="flex items-center gap-2 px-3 py-2 rounded transition-colors text-black"
                >
                  <ArrowLeft size={18} />
                  <span>{t("nav.back")}</span>
                </button>
                <div className="h-6 w-px bg-border mx-2" />
                <ButtonSection view={settingsView} match="general" onClick={() => setSettingsView('general')}>
                  <span>{t("settings.general")}</span>
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
                <ButtonSection view={view} match="customers" onClick={() => setView('customers')}>
                  <Building2 size={18} />
                  <span>{t("nav.customers")}</span>
                </ButtonSection>
                <ButtonSection view={view} match="projects" onClick={() => {
                  if (selectedCustomerId === null) {
                    const loadUncategorizedProjects = async () => {
                      try {
                        const projects = await fetchProjects(null);
                        setProjects(projects);
                      } catch (err) {
                        console.error('Error loading uncategorized projects:', err);
                        setError('Failed to load uncategorized projects');
                      }
                    };
                    loadUncategorizedProjects();
                  } else if (selectedCustomerId) {
                    const loadCustomerProjects = async () => {
                      try {
                        const customerProjects = await fetchProjects(selectedCustomerId);
                        setProjects(customerProjects);
                      } catch (err) {
                        console.error('Error loading customer projects:', err);
                        setError('Failed to load customer projects');
                      }
                    };
                    loadCustomerProjects();
                  }
                  setView('projects');
                }}>
                  <FolderOpen size={18} />
                  <span>{t("nav.projects")}</span>
                </ButtonSection>
                <ButtonSection view={view} match="fields" onClick={() => {
                  if (selectedProjectId) {
                    setView('fields');
                  }
                }}>
                  <Grid size={18} />
                  <span>{t("nav.fields")}</span>
                </ButtonSection>         
                <ButtonSection view={view} match="zones" onClick={() => {
                  if (selectedProjectId && selectedFieldId) {
                    setView('zones');
                  }
                }}>
                  <Map size={18} />
                  <span>{t("nav.zones")}</span>
                </ButtonSection>
                <ButtonSection view={view} match="datapoints" onClick={() => {
                  if (selectedProjectId && selectedFieldId && selectedZoneId) {
                    setView('datapoints');
                    // Find and set the selected zone
                    const project = projects.find(p => p.id === selectedProjectId);
                    const field = project?.fields.find(f => f.id === selectedFieldId);
                    const zone = field?.zones.find(z => z.id === selectedZoneId);
                    if (zone) {
                      setSelectedZone(zone);
                    }
                  }
                }}>
                  <Database size={18} />
                  <span>{t("nav.datapoints")}</span>
                </ButtonSection>
                <ButtonSection view={view} match="analyse" onClick={() => {
                  if (selectedProjectId && selectedFieldId && selectedZoneId) {
                    setView('analyse');
                    // Find and set the selected zone
                    const project = projects.find(p => p.id === selectedProjectId);
                    const field = project?.fields.find(f => f.id === selectedFieldId);
                    const zone = field?.zones.find(z => z.id === selectedZoneId);
                    if (zone) {
                      setSelectedZone(zone);
                    }
                  }
                }}>
                  <FileText size={18} />
                  <span>{t("nav.analyse")}</span>
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
    </Router>
  );
};

export default DashboardLayout;