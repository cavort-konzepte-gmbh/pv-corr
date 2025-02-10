import React, { useState, useEffect } from 'react';
import { Theme, THEMES } from '../types/theme';
import { MapPin } from 'lucide-react';
import { SavedPerson } from '../utils/sampleData';
import { Language, LANGUAGES, useTranslation } from '../types/language';
import { Project } from '../types/projects';
import { Company } from '../types/companies';
import { STANDARDS, Standard } from '../types/standards';
import { fetchProjects } from '../services/projects';
import { createZone } from '../services/zones';
import { useAuth } from './auth/AuthProvider';
import { generateHiddenId } from '../utils/generateHiddenId';
import NavigationBar from './navigation/NavigationBar';
import Sidebar from './navigation/Sidebar';
import ProjectView from './views/ProjectView';
import FieldView from './views/FieldView';
import ZoneView from './views/ZoneView';
import SettingsPanel from './SettingsPanel';
import { SavedPlace } from './PlacesPanel';
import { fetchPlaces } from '../services/places';

const ProjectExplorer = () => {
  const { signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [savedPeople, setSavedPeople] = useState<SavedPerson[]>([]);
  const [showHiddenIds, setShowHiddenIds] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [savedCompanies, setCompanies] = useState<Company[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES.find(theme => theme.id === 'ferra') || THEMES[0]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'projects' | 'settings'>('projects');
  const [settingsView, setSettingsView] = useState<'general' | 'theme' | 'places' | 'people' | 'projects' | 'sample'>('general');
  const [expandedItems, setExpandedItems] = useState(new Set<string>());
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingName, setEditingName] = useState(null);
  const [newName, setNewName] = useState('');
  const [showingHistory, setShowingHistory] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [editingNewRow, setEditingNewRow] = useState(false);
  const [decimalSeparator, setDecimalSeparator] = useState<',' | '.'>(',');
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation(currentLanguage);
  const [showNewZoneDialog, setShowNewZoneDialog] = useState(false);
  const [newZoneData, setNewZoneData] = useState<{
    projectId: string;
    fieldId: string;
    name: string;
  } | null>(null);
  const [newZoneError, setNewZoneError] = useState<string | null>(null);

  const handleLanguageChange = (language: Language) => {
    if (!language || !LANGUAGES.find(l => l.id === language)) return;
    setCurrentLanguage(language);
  };

  const [editingRow, setEditingRow] = useState(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  // Load initial projects when user is authenticated
  // Load initial projects when user is authenticated
  useEffect(() => {
    const loadInitialData = async () => {
      setError(null);
      try {
        setLoading(true);
        const fetchedProjects = await fetchProjects();
        if (fetchedProjects) {
          setProjects(fetchedProjects);
        }
      } catch (error) {
        console.error('Error loading initial projects:', error);
        setError('Failed to load projects. Please try again.');
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
      setDecimalSeparator(settings.decimalSeparator);
      setShowHiddenIds(settings.showHiddenIds);
      const theme = THEMES.find(t => t.id === (settings.theme_id || 'ferra'));
      if (theme) {
        setCurrentTheme(theme);
      }
    };

    window.addEventListener('userSettingsLoaded', handleUserSettings as EventListener);
    return () => {
      window.removeEventListener('userSettingsLoaded', handleUserSettings as EventListener);
    };
  }, []);

  const [standards, setStandards] = useState<Standard[]>(() => {
    // Initialize with default standards from STANDARDS constant
    return STANDARDS;
  });

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  };

  const addField = (projectId: string) => {
    setProjects(prevProjects => prevProjects.map(project => {
      if (project.id !== projectId) return project;
      
      const newField = {
        id: `field-${Date.now()}`,
        hiddenId: generateHiddenId(),
        name: 'New Field',
        gates: [],
        zones: []
      };
      
      return {
        ...project,
        fields: [...project.fields, newField]
      };
    }));
  };

  const addZone = async (projectId: string, fieldId: string) => {
    setNewZoneData({
      projectId,
      fieldId,
      name: ''
    });
    setShowNewZoneDialog(true);
  };

  const handleCreateZone = async () => {
    if (!newZoneData || !newZoneData.name.trim()) {
      setNewZoneError('Zone name is required');
      return;
    }

    try {
      // Create zone in database
      await createZone(newZoneData.fieldId, {
        name: newZoneData.name.trim(),
        latitude: '',
        longitude: ''
      });

      // Fetch fresh project data to ensure we have the complete state
      const updatedProjects = await fetchProjects();
      if (!updatedProjects) {
        throw new Error('Failed to refresh projects data');
      }

      // Update the projects state with fresh data
      setProjects(updatedProjects);

      setShowNewZoneDialog(false);
      setNewZoneData(null);
    } catch (err) {
      console.error('Error creating zone:', err);
      setError(err instanceof Error ? err.message : 'Failed to create zone');
    }
  };

  const handleValueChange = (paramId: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [paramId]: value
    }));
  };

  const startEditing = (datapointId: string) => {
    const project = projects.find(p => 
      p.id === (selectedItem.type === 'project' ? selectedItem.id : selectedItem.projectId)
    );
    if (!project) return;

    const field = project.fields.find(f => f.id === selectedItem.fieldId);
    if (!field) return;

    const zone = field.zones.find(z => z.id === selectedItem.id);
    if (!zone) return;

    const datapoint = zone.datapoints.find(d => d.id === datapointId);
    if (!datapoint) return;

    setEditingRow({ id: datapointId });
    setEditingValues({ ...datapoint.values });
  };

  const handleSaveRow = (datapointId: string, project: any, field: any, zone: any) => {
    if (!datapointId || !project || !field || !zone) return;
    
    if (!Array.isArray(projects)) return;
    
    const timestamp = new Date().toISOString();
    const datapoint = zone.datapoints?.find(d => d.id === datapointId);
    if (!datapoint) return;
    
    const changes = [];
    Object.entries(editingValues).forEach(([paramId, newValue]) => {
      const oldValue = datapoint.values[paramId] || '';
      if (oldValue !== newValue) {
        changes.push({
          timestamp,
          datapointId: datapoint.id,
          parameter: paramId,
          oldValue,
          newValue
        });
      }
    });

    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id !== project.id) return p;
      return {
        ...p,
        fields: p.fields.map(f => {
          if (f.id !== field.id) return f;
          return {
            ...f,
            zones: f.zones.map(z => {
              if (z.id !== zone.id) return z;
              return {
                ...z,
                datapoints: z.datapoints.map(dp => {
                  if (dp.id !== datapoint.id) return dp;
                  return {
                    ...dp,
                    values: editingValues
                  };
                })
              };
            })
          };
        }),
        activityLog: [...(p.activityLog || []), ...changes]
      };
    }));

    setEditingRow(null);
    setEditingValues({});
  };

  const addDatapoint = (projectId: string, fieldId: string, zoneId: string, data: any) => {
    const timestamp = new Date().toISOString();
    const sequentialId = data.sequentialId || `DP${String(zone.datapoints?.length + 1 || 1).padStart(3, '0')}`;
    const changes = Object.entries(data.values).map(([paramId, value]) => ({
      timestamp,
      datapointId: data.id,
      parameter: paramId,
      oldValue: '',
      newValue: value
    }));

    setProjects(prevProjects => {
      return prevProjects.map(project => {
        if (project.id !== projectId) return project;
        
        return {
          ...project,
          activityLog: [...(project.activityLog || []), ...changes],
          fields: project.fields.map(field => {
            if (field.id !== fieldId) return field;
            
            return {
              ...field,
              zones: field.zones.map(zone => {
                if (zone.id !== zoneId) return zone;
                
                const newDatapoint = {
                  id: `dp-${Date.now()}`,
                  hiddenId: generateHiddenId(),
                  sequentialId,
                  type: data.type,
                  values: data.values,
                  ratings: data.ratings,
                  timestamp: new Date().toISOString()
                };
                
                return {
                  ...zone,
                  datapoints: [...(zone.datapoints || []), newDatapoint]
                };
              })
            };
          })
        };
      });
    });
    
    setEditingNewRow(false);
  };

  const handleNameEdit = (
    type: 'field' | 'zone',
    projectId: string,
    id: string,
    currentName: string,
    fieldId?: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setEditingName({ type, projectId, id, currentName });
    setNewName(currentName);
  };

  const handleNameSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editingName || !newName.trim()) {
      setEditingName(null);
      return;
    }

    setProjects(prevProjects => prevProjects.map(project => {
      if (project.id !== editingName.projectId) return project;

      if (editingName.type === 'field') {
        return {
          ...project,
          fields: project.fields.map(field => 
            field.id === editingName.id 
              ? { ...field, name: newName.trim() }
              : field
          )
        };
      } else {
        return {
          ...project,
          fields: project.fields.map(field => ({
            ...field,
            zones: field.zones.map(zone =>
              zone.id === editingName.id
                ? { ...zone, name: newName.trim() }
                : zone
            )
          }))
        };
      }
    }));

    setEditingName(null);
    setNewName('');
  };

  useEffect(() => {
  const fetchPlacesData = async () => {
      try {
        const fetchedPlaces = await fetchPlaces();
        setSavedPlaces(fetchedPlaces);
      } catch (err) {
        console.error('Error fetching places:', err);
        setError('Failed to load places');
      }
    };
     fetchPlacesData();
    
  },[]);


  const renderContent = () => {
    if (view === 'settings') {
      return (
        <div className="flex-1 overflow-auto" style={{ backgroundColor: currentTheme.colors.background }}>
          <SettingsPanel
          view={settingsView}
          onViewChange={setSettingsView}
          decimalSeparator={decimalSeparator}
          onDecimalSeparatorChange={setDecimalSeparator}
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
          standards={standards}
          onStandardsChange={setStandards}
         places={savedPlaces}
        />
        </div>
      );
    }

    if (!selectedItem) return null;

    const project = Array.isArray(projects) ? projects.find(p => 
      p.id === (selectedItem.type === 'project' ? selectedItem.id : selectedItem.projectId)
    ) : null;
    if (!project) return null;

    switch (selectedItem.type) {
      case 'project':
        return (
          <ProjectView
            project={project}
            currentTheme={currentTheme}
            currentLanguage={currentLanguage}
            savedPlaces={savedPlaces}
            savedPeople={savedPeople}
            savedCompanies={savedCompanies}
            showHiddenIds={showHiddenIds}
            onFieldSelect={(fieldId) => setSelectedItem({ 
              type: 'field', 
              projectId: project.id, 
              id: fieldId 
            })}
            onAddField={() => addField(project.id)}
            onProjectsChange={setProjects}
          />
        );

      case 'field': {
        const field = project.fields.find(f => f.id === selectedItem.id);
        if (!field) return null;

        return (
          <FieldView
            project={project}
            field={field}
            showHiddenIds={showHiddenIds}
            currentLanguage={currentLanguage}
            editingName={editingName}
            newName={newName}
            setEditingName={setEditingName}
            setNewName={setNewName}
            decimalSeparator={decimalSeparator}
            handleNameEdit={handleNameEdit}
            handleNameSave={handleNameSave}
            currentTheme={currentTheme}
            onZoneSelect={(zoneId) => setSelectedItem({
              type: 'zone',
              projectId: project.id,
              fieldId: field.id,
              id: zoneId
            })}
            onAddZone={() => addZone(project.id, field.id)}
            onProjectsChange={setProjects}
          />
        );
      }

      case 'zone': {
        const field = project.fields.find(f => f.id === selectedItem.fieldId);
        if (!field) return null;
        const zone = field.zones.find(z => z.id === selectedItem.id);
        if (!zone) return null;

        return (
          <ZoneView
            project={project}
            zone={zone}
            showHiddenIds={showHiddenIds}
            currentLanguage={currentLanguage}
            fieldName={field.name}
            editingName={editingName}
            newName={newName}
            setNewName={setNewName}
            handleNameEdit={handleNameEdit}
            handleNameSave={handleNameSave}
            currentTheme={currentTheme}
            decimalSeparator={decimalSeparator}
            editingRow={editingRow}
            standards={standards}
            editingValues={editingValues}
            editingNewRow={editingNewRow}
            showingHistory={showingHistory}
            setShowingHistory={setShowingHistory}
            setEditingValues={setEditingValues}
            onValueChange={handleValueChange}
            onStartEditing={startEditing}
            onSaveRow={(datapointId) => handleSaveRow(
              datapointId,
              project,
              field,
              zone
            )}
            onCancelEdit={() => {
              setEditingRow(null);
              setEditingValues({});
            }}
            onShowHistory={setShowingHistory}
            onAddDatapoint={() => setEditingNewRow(true)}
            onSubmitDatapoint={(data) => addDatapoint(project.id, field.id, zone.id, data)}
            onCancelNewDatapoint={() => setEditingNewRow(false)}
            onProjectsChange={setProjects}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
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
      <NavigationBar
        onSignOut={signOut}
        view={view}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        onViewChange={setView}
      />
      {view === 'projects' && (
      <Sidebar
        projects={projects}
        expandedItems={expandedItems}
        showHiddenIds={showHiddenIds}
        selectedItem={selectedItem}
        currentTheme={currentTheme}
        onToggleExpand={toggleExpand}
        onSelectItem={setSelectedItem}
      />
      )}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: currentTheme.colors.background }}>
        {renderContent()}
      </div>
      
      {showNewZoneDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg max-w-md w-full"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 
              className="text-lg mb-4 flex items-center gap-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              <MapPin size={20} style={{ color: currentTheme.colors.accent.primary }} />
              {t('zone.new')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  {t('zone.name')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={newZoneData?.name || ''}
                  onChange={(e) => setNewZoneData(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    border: `1px solid ${currentTheme.colors.border}`,
                    color: currentTheme.colors.text.primary
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateZone();
                    }
                  }}
                />
                {newZoneError && (
                  <p className="text-sm mt-1" style={{ color: currentTheme.colors.accent.primary }}>
                    {newZoneError}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNewZoneDialog(false);
                    setNewZoneData(null);
                    setNewZoneError(null);
                  }}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'transparent',
                    color: currentTheme.colors.text.secondary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  {t('actions.cancel')}
                </button>
                <button
                  onClick={handleCreateZone}
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.accent.primary,
                    color: 'white'
                  }}
                >
                  {t('actions.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectExplorer;