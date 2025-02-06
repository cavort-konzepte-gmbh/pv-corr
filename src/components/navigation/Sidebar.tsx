import React from 'react';
import { Theme } from '../../types/theme';
import { Project } from '../../types/projects';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  expandedItems: Set<string>;
  showHiddenIds: boolean;
  selectedItem: any;
  currentTheme: Theme;
  onToggleExpand: (id: string) => void;
  onSelectItem: (item: any) => void;
}

const ensureArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (Array.isArray(value)) return value;
  return [];
};

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  expandedItems,
  showHiddenIds,
  selectedItem,
  currentTheme,
  onToggleExpand,
  onSelectItem
}) => {
  return (
    <div 
      className="w-64 border-r h-screen overflow-auto"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border 
      }}
    >
      <div>
        {ensureArray(projects).map(project => (
          <div key={project.id}>
            <div 
              className="flex items-center h-7 px-2 cursor-pointer hover:bg-opacity-10 group"
              style={{
                color: currentTheme.colors.text.primary,
                backgroundColor: selectedItem?.type === 'project' && selectedItem?.id === project.id ? currentTheme.colors.background : 'transparent'
              }}
              onClick={() => {
                onSelectItem({ type: 'project', id: project.id });
                onToggleExpand(project.id);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center min-w-0">
                  <span 
                    className="w-4 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(project.id);
                    }}
                  >
                    {expandedItems.has(project.id) ? (
                      <ChevronDown 
                        size={14}
                        style={{ color: currentTheme.colors.text.secondary }} 
                      />
                    ) : (
                      <ChevronRight 
                        size={14}
                        style={{ color: currentTheme.colors.text.secondary }} 
                      />
                    )}
                  </span>
                  <span className="ml-1 font-mono text-xs truncate">
                    {project.name.length > 28 ? project.name.substring(0, 28) + '...' : project.name}
                  </span>
                </div>
                <div 
                  className="text-[10px] opacity-60 ml-1"
                  style={{
                    color: currentTheme.colors.text.secondary
                  }}
                >
                  {project.fields.length}f
                </div>
              </div>
            </div>
            
            {expandedItems.has(project.id) && (
              <div>
                {project.fields.map(field => (
                  <div key={field.id}>
                    <div 
                      className="flex items-center h-7 pl-6 pr-2 cursor-pointer hover:bg-opacity-10 group"
                      style={{
                        color: currentTheme.colors.text.primary,
                        backgroundColor: selectedItem?.type === 'field' && selectedItem?.id === field.id ? currentTheme.colors.background : 'transparent'
                      }}
                      onClick={() => {
                        onSelectItem({ type: 'field', projectId: project.id, id: field.id });
                        onToggleExpand(field.id);
                      }}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <span 
                          className="w-4 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand(field.id);
                          }}
                        >
                          {expandedItems.has(field.id) ? (
                            <ChevronDown 
                              size={14}
                              style={{ color: currentTheme.colors.text.secondary }} 
                            />
                          ) : (
                            <ChevronRight 
                              size={14}
                              style={{ color: currentTheme.colors.text.secondary }} 
                            />
                          )}
                        </span>
                        <span className="ml-1 font-mono text-xs truncate">
                          {field.name.length > 26 ? field.name.substring(0, 26) + '...' : field.name}
                        </span>
                      </div>
                      <div 
                        className="text-[10px] opacity-60 ml-1"
                        style={{
                          color: currentTheme.colors.text.secondary
                        }}
                      >
                        {field.zones.length}z
                      </div>
                    </div>
                    
                    {expandedItems.has(field.id) && (
                      <div>
                        {field.zones.map(zone => (
                          <div 
                            key={zone.id}
                            className="flex items-center h-7 pl-10 pr-2 cursor-pointer hover:bg-opacity-10 group"
                            style={{
                              color: currentTheme.colors.text.primary,
                              backgroundColor: selectedItem?.type === 'zone' && selectedItem?.id === zone.id ? currentTheme.colors.background : 'transparent'
                            }}
                            onClick={() => onSelectItem({
                              type: 'zone',
                              projectId: project.id,
                              fieldId: field.id,
                              id: zone.id
                            })}
                          >
                            <span className="font-mono text-xs truncate flex-1">
                              {zone.name.length > 24 ? zone.name.substring(0, 24) + '...' : zone.name}
                            </span>
                            <span 
                              className="text-[10px] opacity-60 ml-1"
                              style={{
                                color: currentTheme.colors.text.secondary
                              }}
                            >
                              {zone.datapoints?.length || 0}dp
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;