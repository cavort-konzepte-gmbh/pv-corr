import React from 'react';
import { Theme, THEMES } from '../types/theme';
import PlacesPanel, { SavedPlace } from './PlacesPanel';
import PeoplePanel from './PeoplePanel';
import CompaniesPanel from './CompaniesPanel';
import ProjectsPanel from './ProjectsPanel';
import { useState, useEffect, useCallback } from 'react';
import { SavedPerson } from '../utils/sampleData';
import { loadSamplePlaces, loadSamplePeople, loadSampleCompanies, loadSampleProjects } from '../services/sampleData';
import { Project } from '../types/projects';
import DatapointsPanel from './DatapointsPanel';
import { Language, LANGUAGES } from '../types/language';
import { useTranslation } from '../types/language';
import { Standard } from '../types/standards';
import { updateUserSettings } from '../services/userSettings';
import { Company } from '../types/companies';
import { ThemeId } from '../types/theme';

interface SettingsPanelProps {
  view: 'general' | 'theme' | 'places' | 'people' | 'companies' | 'projects' | 'sample' | 'datapoints';
  onViewChange: (view: 'general' | 'theme' | 'places' | 'people' | 'companies' | 'projects' | 'sample' | 'datapoints') => void;
  showHiddenIds: boolean;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onShowHiddenIdsChange: (show: boolean) => void;
  decimalSeparator: ',' | '.';
  onDecimalSeparatorChange: (separator: ',' | '.') => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  standards: Standard[];
  onStandardsChange: (standards: Standard[]) => void;
  savedCompanies: Company[];
  onSaveCompanies: (companies: Company[]) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  view,
  onViewChange,
  showHiddenIds,
  currentLanguage,
  onLanguageChange,
  onShowHiddenIdsChange,
  decimalSeparator,
  onDecimalSeparatorChange,
  currentTheme,
  onThemeChange,
  onClose,
  projects,
  onProjectsChange,
  standards,
  onStandardsChange
}) => {
  const t = useTranslation(currentLanguage);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [savedPeople, setSavedPeople] = useState<SavedPerson[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sampleData, setSampleData] = useState({
    all: false,
    places: false,
    people: false,
    companies: false,
    projects: false
  });

  const handleLanguageChange = async (language: Language) => {
    if (!language || !LANGUAGES.find(l => l.id === language)) return;
    const success = await updateUserSettings({ language });
    if (success) {
      onLanguageChange(language);
    }
  };

  const handleDecimalSeparatorChange = async (separator: ',' | '.') => {
    const success = await updateUserSettings({ decimalSeparator: separator });
    if (success) {
      onDecimalSeparatorChange(separator);
    }
  };

  const handleShowHiddenIdsChange = async (show: boolean) => {
    const success = await updateUserSettings({ showHiddenIds: show });
    if (success) {
      onShowHiddenIdsChange(show);
    }
  };

  const handleThemeChange = async (theme: Theme) => {
    const success = await updateUserSettings({ theme_id: theme.id as ThemeId });
    if (success) {
      onThemeChange(theme);
    }
  };

  useEffect(() => {
    // Load state from localStorage
    setSampleData({
      all: localStorage.getItem('sampleData.all') === 'true',
      places: localStorage.getItem('sampleData.places') === 'true',
      people: localStorage.getItem('sampleData.people') === 'true',
      companies: localStorage.getItem('sampleData.companies') === 'true',
      projects: localStorage.getItem('sampleData.projects') === 'true'
    });
  }, []);

  const loadData = useCallback(async () => {
    if (sampleData.places) {
      const places = await loadSamplePlaces();
      setSavedPlaces(places);
      
      if (sampleData.people) {
        const people = await loadSamplePeople();
        setSavedPeople(people);
      }
      
      if (sampleData.companies) {
        const companies = await loadSampleCompanies();
        setCompanies(companies);
      }
    }
  }, [sampleData.places, sampleData.people, sampleData.companies]);

  useEffect(() => {
    loadData();
  }, [sampleData.places, sampleData.people]);

  const menuItems = [
    { id: 'general', label: t('settings.general'), icon: 'Settings' },
    { id: 'theme', label: t('settings.theme'), icon: 'Palette' },
    { id: 'datapoints', label: t('settings.datapoints'), icon: 'Database' },
    { id: 'places', label: t('settings.sample_data.places'), icon: 'MapPin' },
    { id: 'companies', label: t('settings.companies'), icon: 'Building2' },
    { id: 'people', label: t('settings.sample_data.people'), icon: 'Users' },
    { id: 'projects', label: t('nav.projects'), icon: 'FolderOpen' },
    { id: 'sample', label: t('settings.sample_data'), icon: 'Database' }
  ];

  const handleSampleDataToggle = async (type: 'all' | 'places' | 'people' | 'projects' | 'companies') => {
    const newValue = !sampleData[type];
    
    const updateProjects = async (shouldAdd: boolean) => {
      if (shouldAdd) {
        const sampleProjects = await loadSampleProjects();
        onProjectsChange(sampleProjects);
      } else {
        onProjectsChange([]);
      }
    };
    
    if (type === 'all') {
      // Toggle all
      const newState = {
        all: newValue,
        places: newValue,
        people: newValue,
        companies: newValue,
        projects: newValue
      };
      setSampleData(newState);
      
      // Persist state
      Object.entries(newState).forEach(([key, value]) => {
        localStorage.setItem(`sampleData.${key}`, value.toString());
      });
      
      // Update data based on new state
      if (newValue) {
        await loadData();
        updateProjects(true);
      } else {
        setSavedPlaces([]);
        setSavedPeople([]);
        setCompanies([]);
        updateProjects(false);
      }
    } else {
      // Toggle individual
      const newState = {
        ...sampleData,
        [type]: newValue,
        // Update 'all' if all individual items are toggled
        all: type === 'places' ? 
          newValue && sampleData.people && sampleData.companies && sampleData.projects :
          type === 'people' ?
          sampleData.places && newValue && sampleData.companies && sampleData.projects :
          type === 'companies' ?
          sampleData.places && sampleData.people && newValue && sampleData.projects :
          sampleData.places && sampleData.people && sampleData.companies && newValue
      };
      setSampleData(newState);

      // Persist state
      Object.entries(newState).forEach(([key, value]) => {
        localStorage.setItem(`sampleData.${key}`, value.toString());
      });
      
      // Update specific data
      switch (type) {
        case 'places':
          if (newValue) {
            await loadData();
          } else {
            setSavedPlaces([]);
            // Clear people and companies if they depend on places
            setSavedPeople([]);
            setCompanies([]);
            setSampleData(prev => ({ 
              ...prev, 
              people: false,
              companies: false 
            }));
          }
          break;
        case 'people':
          if (newValue && sampleData.places) {
            const people = await loadSamplePeople();
            setSavedPeople(people);
          } else {
            setSavedPeople([]);
            // Clear companies if they depend on people
            if (sampleData.companies) {
              setCompanies([]);
              setSampleData(prev => ({ ...prev, companies: false }));
            }
          }
          break;
        case 'companies':
          if (newValue && sampleData.places && sampleData.people) {
            const companies = await loadSampleCompanies();
            setCompanies(companies);
          } else {
            setCompanies([]);
          }
          break;
        case 'projects':
          await updateProjects(newValue);
          break;
      }
    }
  };

  return (
    <div className="flex h-screen">
      <div 
        className="w-64 border-r h-screen overflow-auto"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border 
        }}
      >
        <div>
          {menuItems.map(item => (
            <div
              key={item.id}
              className="flex items-center h-7 px-2 cursor-pointer hover:bg-opacity-10 group"
              style={{
                color: currentTheme.colors.text.primary,
                backgroundColor: view === item.id ? currentTheme.colors.background : 'transparent'
              }}
              onClick={() => onViewChange(item.id as any)}
            >
              <span className="ml-1 font-mono text-xs truncate">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-auto" style={{ backgroundColor: currentTheme.colors.background }}>
        {view === 'general' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded"
              style={{ backgroundColor: currentTheme.colors.border }}>
              <div>
                <span style={{ color: currentTheme.colors.text.primary }}>
                  {t('settings.language')}
                </span>
                <div className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                  {t('settings.language.description')}
                </div>
              </div>
              <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="px-3 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: 'transparent',
                  color: currentTheme.colors.text.secondary,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded"
              style={{ backgroundColor: currentTheme.colors.border }}>
              <div>
                <span style={{ color: currentTheme.colors.text.primary }}>
                  {t('settings.decimal_separator')}
                </span>
                <div className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                  {t('settings.decimal_separator.description')}
                </div>
              </div>
              <select
                value={decimalSeparator}
                onChange={(e) => handleDecimalSeparatorChange(e.target.value as ',' | '.')}
                className="px-3 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: 'transparent',
                  color: currentTheme.colors.text.secondary,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                <option value=",">{t('settings.decimal_separator.comma')}</option>
                <option value=".">{t('settings.decimal_separator.point')}</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded"
              style={{ backgroundColor: currentTheme.colors.border }}>
              <div>
                <span style={{ color: currentTheme.colors.text.primary }}>
                  {t('settings.hidden_ids')}
                </span>
                <div className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                  {t('settings.hidden_ids.description')}
                </div>
              </div>
              <button
                onClick={() => handleShowHiddenIdsChange(!showHiddenIds)}
                className="px-3 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: showHiddenIds ? currentTheme.colors.accent.primary : 'transparent',
                  color: showHiddenIds ? 'white' : currentTheme.colors.text.secondary,
                  border: showHiddenIds ? 'none' : `1px solid ${currentTheme.colors.border}`
                }}
              >
                {t(showHiddenIds ? 'settings.enabled' : 'settings.not_enabled')}
              </button>
            </div>
          </div>
        )}

        {view === 'theme' && (
          <div className="space-y-4">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme)}
                className="w-full p-4 rounded text-left transition-all duration-200 hover:translate-x-1"
                style={{ 
                  backgroundColor: currentTheme.colors.surface,
                  border: `1px solid ${currentTheme.colors.border}`,
                  color: currentTheme.colors.text.primary
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{theme.name}</div>
                    <div className="text-sm mt-1" style={{ color: currentTheme.colors.text.secondary }}>
                      {theme.id === currentTheme.id && 'Currently active'}
                    </div>
                  </div>
                  {theme.id === currentTheme.id && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.colors.accent.primary }}
                    />
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <div 
                    className="flex-1 h-1 rounded"
                    style={{ backgroundColor: theme.colors.background }}
                  />
                  <div 
                    className="flex-1 h-1 rounded"
                    style={{ backgroundColor: theme.colors.surface }}
                  />
                  <div 
                    className="flex-1 h-1 rounded"
                    style={{ backgroundColor: theme.colors.border }}
                  />
                  <div 
                    className="flex-1 h-1 rounded"
                    style={{ backgroundColor: theme.colors.accent.primary }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {view === 'sample' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded"
              style={{ backgroundColor: currentTheme.colors.border }}>
              <div>
                <span style={{ color: currentTheme.colors.text.primary }}>
                  {t('settings.sample_data')}
                </span>
                <div className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                  {t('settings.sample_data.description')}
                </div>
              </div>
              <button 
                onClick={async () => await handleSampleDataToggle('all')}
                className="px-3 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: sampleData.all ? currentTheme.colors.accent.primary : 'transparent',
                  color: sampleData.all ? 'white' : currentTheme.colors.text.secondary,
                  border: sampleData.all ? 'none' : `1px solid ${currentTheme.colors.border}`
                }}
              >
                {t(sampleData.all ? 'settings.enabled' : 'settings.not_enabled')}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded ml-4"
              style={{ backgroundColor: currentTheme.colors.border }}>
              <div>
                <span style={{ color: currentTheme.colors.text.primary }}>
                  {t('settings.sample_data.places')}
                </span>
                <div className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                  {t('settings.sample_data.places.description')}
                </div>
              </div>
              <button 
                onClick={async () => await handleSampleDataToggle('places')}
                className="px-3 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: sampleData.places ? currentTheme.colors.accent.primary : 'transparent',
                  color: sampleData.places ? 'white' : currentTheme.colors.text.secondary,
                  border: sampleData.places ? 'none' : `1px solid ${currentTheme.colors.border}`
                }}
              >
                {t(sampleData.places ? 'settings.enabled' : 'settings.not_enabled')}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded ml-4"
              style={{ backgroundColor: currentTheme.colors.border }}>
              <div>
                <span style={{ color: currentTheme.colors.text.primary }}>
                  {t('settings.sample_data.people')}
                </span>
                <div className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                  {t('settings.sample_data.people.description')}
                  {!sampleData.places && (
                    <span className="text-red-400 ml-1">{t('settings.sample_data.people.requires_places')}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={async () => await handleSampleDataToggle('people')}
                disabled={!sampleData.places}
                className="px-3 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: sampleData.people ? currentTheme.colors.accent.primary : 'transparent',
                  color: sampleData.people ? 'white' : currentTheme.colors.text.secondary,
                  border: sampleData.people ? 'none' : `1px solid ${currentTheme.colors.border}`,
                  opacity: !sampleData.places ? 0.5 : 1
                }}
              >
                {t(sampleData.people ? 'settings.enabled' : 'settings.not_enabled')}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded ml-4"
              style={{ backgroundColor: currentTheme.colors.border }}>
              <div>
                <span style={{ color: currentTheme.colors.text.primary }}>
                  {t('settings.companies')}
                </span>
                <div className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                  {t('settings.sample_data.companies.description')}
                  {!sampleData.places && (
                    <span className="text-red-400 ml-1">{t('settings.sample_data.companies.requires_places')}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={async () => await handleSampleDataToggle('companies')}
                disabled={!sampleData.places || !sampleData.people}
                className="px-3 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: sampleData.companies ? currentTheme.colors.accent.primary : 'transparent',
                  color: sampleData.companies ? 'white' : currentTheme.colors.text.secondary,
                  border: sampleData.companies ? 'none' : `1px solid ${currentTheme.colors.border}`,
                  opacity: (!sampleData.places || !sampleData.people) ? 0.5 : 1
                }}
              >
                {t(sampleData.companies ? 'settings.enabled' : 'settings.not_enabled')}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded ml-4"
              style={{ backgroundColor: currentTheme.colors.border }}>
              <div>
                <span style={{ color: currentTheme.colors.text.primary }}>
                  {t('settings.sample_data.projects')}
                </span>
                <div className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                  {t('settings.sample_data.projects.description')}
                </div>
              </div>
              <button 
                onClick={async () => await handleSampleDataToggle('projects')}
                className="px-3 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: sampleData.projects ? currentTheme.colors.accent.primary : 'transparent',
                  color: sampleData.projects ? 'white' : currentTheme.colors.text.secondary,
                  border: sampleData.projects ? 'none' : `1px solid ${currentTheme.colors.border}`
                }}
              >
                {t(sampleData.projects ? 'settings.enabled' : 'settings.not_enabled')}
              </button>
            </div>
          </div>
        )}

        {view === 'places' && (
          <PlacesPanel 
            currentTheme={currentTheme}
            savedPlaces={savedPlaces}
            onSavePlaces={setSavedPlaces}
          />
        )}

        {view === 'people' && (
          <PeoplePanel 
            currentTheme={currentTheme}
            savedPlaces={savedPlaces}
            savedPeople={savedPeople}
            onSavePeople={setSavedPeople}
          />
        )}

        {view === 'companies' && (
          <CompaniesPanel
            currentTheme={currentTheme}
            savedPlaces={savedPlaces}
            savedPeople={savedPeople}
            savedCompanies={companies}
            onSaveCompanies={setCompanies}
          />
        )}

        {view === 'projects' && (
          <ProjectsPanel
            currentTheme={currentTheme}
            savedPlaces={savedPlaces}
            savedPeople={savedPeople}
            savedCompanies={companies}
            projects={projects}
            onProjectsChange={onProjectsChange}
          />
        )}

        {view === 'datapoints' && (
          <DatapointsPanel
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            standards={standards}
            onStandardsChange={onStandardsChange}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;