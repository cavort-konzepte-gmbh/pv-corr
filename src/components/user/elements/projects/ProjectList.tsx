import React from 'react';
import { Theme } from '../../../../types/theme';
import { Project } from '../../../../types/projects';
import { Customer } from '../../../../types/customers';
import { Folder, MapPin, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ProjectListProps {
  currentTheme: Theme;
  projects: Project[];
  customers: Customer[];
  selectedCustomerId: string | null;
  onMoveProject: (projectId: string, customerId: string | null) => void;
  onSelectProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  currentTheme,
  projects,
  customers,
  selectedCustomerId,
  onMoveProject,
  onSelectProject
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <div 
          key={project.id}
          className="p-4 rounded-lg border transition-all hover:translate-x-1 text-primary border-theme bg-surface"
          onClick={() => onSelectProject(project.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Folder className="text-accent-primary" size={16} />
              <span className="font-medium">{project.name}</span>                
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowMoveMenu(showMoveMenu === project.id ? null : project.id);
                }}
                className="px-2 py-1 text-xs rounded hover:bg-opacity-80 text-white bg-accent-primary"                
              >
                Move
              </button>
              <ChevronRight className="text-secondary" size={16} />
            </div>
          </div>
          <div className="text-sm text-secondary">
            {project.fields.length} fields • {
              project.fields.reduce((acc, field) => acc + field.zones.length, 0)
            } zones • {
              project.fields.reduce((acc, field) => 
                acc + field.zones.reduce((zAcc, zone) => 
                  zAcc + (zone.datapoints?.length || 0), 0
                ), 0
            ) } datapoints • Project Type: {project.typeProject}
          </div>
          {showMoveMenu === project.id && (
            <div className="mt-4 space-y-2">
              {/* Show "Move to No Customer" option if project has a customer */}
              {selectedCustomerId && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onMoveProject(project.id, null);
                    setShowMoveMenu(null);
                  }}
                  className="w-full p-2 text-left rounded hover:bg-opacity-10 text-sm text-primary bg-theme"                  
                >
                  Move to No Customer
                </button>
              )}
              {/* Show all other customers except current one */}
              {customers
                .filter(c => c.id !== selectedCustomerId)
                .map(customer => (
                  <button
                    key={customer.id}
                    onClick={e => {
                      e.stopPropagation();
                      onMoveProject(project.id, customer.id);
                      setShowMoveMenu(null);
                    }}
                    className="w-full p-2 text-left rounded hover:bg-opacity-10 text-sm"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text.primary
                    }}
                  >
                    Move to {customer.name}
                  </button>
                ))
              }
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectList;