import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Project } from '../../../../types/projects';
import { Person } from '../../../../types/people';
import { Company } from '../../../../types/companies';
import { Building2, ChevronDown, ChevronRight, Edit2, Save, X, Upload } from 'lucide-react';
import MediaDialog from '../../../shared/MediaDialog';
import { Language, useTranslation } from '../../../../types/language';
import { updateProject, fetchProjects } from '../../../../services/projects';

interface ProjectSummaryProps {
  project: Project;
  manager?: Person;
  company?: Company;
  currentTheme: Theme;
  currentLanguage: Language; 
  savedPeople: Person[];
  onProjectsChange: (projects: Project[]) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({
  project,
  manager,
  company,
  currentTheme,
  currentLanguage,
  savedPeople,
  onProjectsChange,
  isExpanded = true,
  onToggle
}) => {
  const translation = useTranslation(currentLanguage);
  const [showMediaDialog, setShowMediaDialog] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    managerId: project.managerId || '',
    typeProject: project.typeProject || 'field',
    latitude: project.latitude || '',
    longitude: project.longitude || ''
  });

  const handleSave = async () => {
    try {
      const updatedProject = await updateProject({
        ...project,
        managerId: editValues.managerId,
        typeProject: editValues.typeProject,
        latitude: editValues.latitude,
        longitude: editValues.longitude
      });
      
      const updatedProjects = await fetchProjects();
      onProjectsChange(updatedProjects);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };


  return (
    <div className="mb-8">
      <table className="w-full border-collapse rounded-lg border transition-all text-primary border-theme bg-surface">
        <thead>
          <tr>
            <th colSpan={2} className="p-4 text-left border-b font-semibold border-theme cursor-pointer" onClick={onToggle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="text-accent-primary" size={16} />
                  <div className="flex items-center gap-4">
                    <span>{project.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-secondary bg-border">
                        {project.typeProject === 'field' ? translation("project.type.field") : translation("project.type.roof")}
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
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(false);
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMediaDialog(project.id);
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <Upload size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <Edit2 size={14} />
                      </button>
                    </>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="text-secondary" size={16} />
                  ) : (
                    <ChevronRight className="text-secondary" size={16} />
                  )}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className={isExpanded ? '' : 'hidden'}>
          <tr>
            <td className="p-2 border-b border-r border-theme w-1/6 text-secondary">
              {translation("project.type")}
            </td>
            <td className="p-2 border-b border-theme">
              {isEditing ? (
                <select
                  value={editValues.typeProject}
                  onChange={(e) => setEditingValues({ ...editValues, typeProject: e.target.value })}
                  className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="field">{translation("project.type.field")}</option>
                  <option value="roof">{translation("project.type.roof")}</option>
                </select>
              ) : (
                translation(project.typeProject === 'field' ? "project.type.field" : "project.type.roof")
              )}
            </td>
          </tr>
          <tr>
            <td className="p-2 border-b border-r border-theme w-1/6 text-secondary">
              {translation("project.manager")}
            </td>
            <td className="p-2 border-b border-theme">
              {isEditing ? (
                <select
                  value={editValues.managerId}
                  onChange={(e) => setEditValues({ ...editValues, managerId: e.target.value })}
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
                manager ? `${manager.firstName} ${manager.lastName}` : translation("project.manager.not_assigned")
              )}
            </td>
          </tr>
          <tr>
            <td className="p-2 border-r border-theme w-1/6 text-secondary">
              {translation("zones.location")}
            </td>
            <td className="p-2 border-theme">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editValues.latitude}
                    onChange={(e) => setEditValues({ ...editValues, latitude: e.target.value })}
                    className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder={translation("project.latitude")}
                  />
                  <input
                    type="text"
                    value={editValues.longitude}
                    onChange={(e) => setEditValues({ ...editValues, longitude: e.target.value })}
                    className="w-1/2 p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    placeholder={translation("project.longitude")}
                  />
                </div>
              ) : project.latitude && project.longitude ? (
                <div className="flex items-center justify-between">
                  <span>{project.latitude}, {project.longitude}</span>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps?q=${project.latitude},${project.longitude}`, '_blank')}
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
      {showMediaDialog && (
        <MediaDialog
          isOpen={true}
          onClose={() => setShowMediaDialog(null)}
          entityId={showMediaDialog}
          currentTheme={currentTheme}
        />
      )}
      {showMediaDialog && (
        <MediaDialog
          isOpen={true}
          onClose={() => setShowMediaDialog(null)}
          entityId={showMediaDialog}
          currentTheme={currentTheme}
          entityType="project"
        />
      )}
    </div>
  );
};

export default ProjectSummary;