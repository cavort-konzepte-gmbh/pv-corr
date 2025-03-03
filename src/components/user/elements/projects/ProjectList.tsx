import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Project } from '../../../../types/projects';
import { Customer } from '../../../../types/customers';
import { Folder, MapPin, ChevronRight, Edit2, Save, X, User } from 'lucide-react';
import { Language, useTranslation } from '../../../../types/language';
import { Person } from '../../../../types/people';
import { updateProject } from '../../../../services/projects';

interface ProjectListProps {
  currentTheme: Theme;
  projects: Project[];
  savedPeople: Person[];
  customers: Customer[];
  selectedCustomerId: string | null;
  onMoveProject: (projectId: string, customerId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  currentLanguage: Language;
}

const ProjectList: React.FC<ProjectListProps> = ({
  currentTheme,
  projects,
  savedPeople,
  customers,
  selectedCustomerId,
  onMoveProject,
  onSelectProject,
  currentLanguage
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const translation = useTranslation(currentLanguage);

  const handleSaveProject = async (project: Project) => {
    try {
      await updateProject({
        ...project,
        ...editingValues
      });
      setEditingProject(null);
      setEditingValues({});
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <div key={project.id} className="relative">
          <table
            className="w-full border-collapse rounded-lg border transition-all hover:translate-x-1 text-primary border-theme bg-surface hover:cursor-pointer"
            onClick={() => onSelectProject(project.id)}
          >
            <thead>
              <tr>
                <th colSpan={2} className="p-4 text-left border-b font-semibold border-theme bg-surface">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="text-accent-primary" size={16} />
                      <div className="flex items-center gap-4">
                        <span>{project.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-secondary bg-border">
                            {project.typeProject}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-secondary bg-border">
                            {project.fields.length} {translation("fields")}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-secondary bg-border">
                            {project.fields.reduce((acc, field) => acc + field.zones.length, 0)} {translation("zones")}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-secondary bg-border">
                            {project.fields.reduce((acc, field) => 
                              acc + field.zones.reduce((zAcc, zone) => 
                                zAcc + (zone.datapoints?.length || 0), 0
                              ), 0
                            )} {translation("datapoints")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingProject === project.id ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveProject(project);
                            }}
                            className="p-1 rounded hover:bg-opacity-80 text-secondary"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(null);
                              setEditingValues({});
                            }}
                            className="p-1 rounded hover:bg-opacity-80 text-secondary"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(project.id);
                            setEditingValues({
                              managerId: project.managerId,
                              latitude: project.latitude,
                              longitude: project.longitude,
                              typeProject: project.typeProject
                            });
                          }}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {editingProject === project.id && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setShowMoveMenu(showMoveMenu === project.id ? null : project.id);
                          }}
                          className="px-2 py-1 text-xs rounded hover:bg-opacity-80 text-white bg-accent-primary"
                        >
                          Move
                        </button>
                      )}
                      <ChevronRight className="text-secondary" size={16} />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-r border-theme w-1/6 text-secondary">
                  {translation("project.manager")}
                </td>
                <td className="p-2 border-b border-theme">
                  {editingProject === project.id ? (
                    <select
                      value={editingValues.managerId || ''}
                      onChange={(e) => setEditingValues({ ...editingValues, managerId: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    >
                      <option value="">{translation("project.manager.not_assigned")}</option>
                      {savedPeople.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>
                      {savedPeople?.find(p => p.id === project.managerId)
                        ? `${savedPeople?.find(p => p.id === project.managerId)?.firstName} ${savedPeople?.find(p => p.id === project.managerId)?.lastName}`
                        : translation("project.manager.not_assigned")}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r border-theme w-1/6 text-secondary">
                  {translation("zones.location")}
                </td>
                <td className="p-2 border-theme">
                  {editingProject === project.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingValues.latitude || project.latitude || ''}
                        onChange={(e) => setEditingValues({ ...editingValues, latitude: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        placeholder={translation("project.latitude")}
                      />
                      <input
                        type="text"
                        value={editingValues.longitude || project.longitude || ''}
                        onChange={(e) => setEditingValues({ ...editingValues, longitude: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        placeholder={translation("project.longitude")}
                      />
                    </div>
                  ) : project.latitude && project.longitude ? (
                    <div className="flex items-center justify-between">
                      <span>{project.latitude}, {project.longitude}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.google.com/maps?q=${project.latitude},${project.longitude}`, '_blank');
                        }}
                        className="text-sm hover:underline text-accent-primary"
                      >
                        {translation("general.view_on_map")}
                      </button>
                    </div>
                  ) : (
                    <span className="text-secondary">{translation("general.location_not_set")}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          {showMoveMenu === project.id && (
            <div className="mt-4 space-y-2">
              {selectedCustomerId && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onMoveProject(project.id, null);
                    setShowMoveMenu(null);
                  }}
                  className="w-full p-2 text-left rounded hover:bg-opacity-10 text-sm"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text.primary
                  }}
                >
                  Move to No Customer
                </button>
              )}
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