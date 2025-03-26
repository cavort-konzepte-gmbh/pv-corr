import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Project } from '../../../../types/projects';
import { Person } from '../../../../types/people';
import { Company } from '../../../../types/companies';
import { Building2, ChevronDown, ChevronRight, Edit2, Save, X, Upload} from 'lucide-react';
import MediaDialog from '../../../shared/MediaDialog';
import { Language, useTranslation } from '../../../../types/language';
import { updateProject, fetchProjects } from '../../../../services/projects';
import { TableBody, TableCell, TableHead, TableHeader, TableRow , Table} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  selectedCustomerId: string | null;
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
  onToggle,
  selectedCustomerId
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
      <Table>
        <TableHeader>
          <TableRow>
 

            <TableHead colSpan={2} className="p-4 text-left font-semibold text-card-foreground cursor-pointer" onClick={onToggle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="text-accent-primary" size={16} />
                  <div className="flex items-center gap-4">
                    <span>{project.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-primary bg-background">
                        {project.typeProject === 'field' ? translation("project.type.field") : translation("project.type.roof")}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-primary bg-background">
                        {project.fields.length} {translation("fields")}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-primary bg-background">
                        {project.fields.reduce((acc, field) => acc + field.zones.length, 0)} {translation("zones")}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 text-primary bg-background">
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
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                        }}
                        className="size-8 p-1 rounded hover:bg-opacity-80"
                      >
                        <Save size={14} />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(false);
                        }}
                        className="size-8 p-1 rounded hover:bg-opacity-80"
                      >
                        <X size={14} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMediaDialog(project.id);
                        }}
                        className="size-8 p-1 rounded hover:bg-opacity-80"
                      >
                        <Upload size={14} />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
                        className="size-8 p-1 rounded hover:bg-opacity-80"
                      >
                        <Edit2 size={14} />
                      </Button>
                    </>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="text-primary" size={16} />
                  ) : (
                    <ChevronRight className="text-primary" size={16} />
                  )}
                </div>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
   
        <TableBody className={isExpanded ? '' : 'hidden'}>
          <TableRow>
            <TableCell className="p-2 border-b border-r border-accent w-1/6 text-primary">
              {translation("project.type")}
            </TableCell>
            <TableCell className="p-2">
              {isEditing ? (
                <select
                  value={editValues.typeProject}
                  onChange={(e) => setEditValues({ ...editValues, typeProject: e.target.value })}
                  className="w-full p-1 rounded text-sm text-primary border border-input shadow-sm bg-accent"
                >
                  <option value="field">{translation("project.type.field")}</option>
                  <option value="roof">{translation("project.type.roof")}</option>
                </select>
              ) : (
                translation(project.typeProject === 'field' ? "project.type.field" : "project.type.roof")
              )}
            </TableCell>
          </TableRow>
          < TableRow >
            <TableCell className="p-2 w-1/6 text-primary">
              {translation("project.manager")}
            </TableCell>
            <TableCell className="p-2">
              {isEditing ? (
                <select
                  value={editValues.managerId}
                  onChange={(e) => setEditValues({ ...editValues, managerId: e.target.value })}
                  className="w-full p-1 rounded text-sm text-primary border border-input shadow-sm bg-accent"
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
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="p-2 w-1/6 text-primary">
              {translation("zones.location")}
            </TableCell>
            <TableCell className="p-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={editValues.latitude}
                    onChange={(e) => setEditValues({ ...editValues, latitude: e.target.value })}
                    className="w-1/2 p-1"
                    placeholder={translation("project.latitude")}
                  />
                  <Input
                    type="text"
                    value={editValues.longitude}
                    onChange={(e) => setEditValues({ ...editValues, longitude: e.target.value })}
                    className="w-1/2 p-1"
                    placeholder={translation("project.longitude")}
                  />
                </div>
              ) : project.latitude && project.longitude ? (
                <div className="flex items-center justify-between">
                  <span>{project.latitude}, {project.longitude}</span>
                  <Button
                    onClick={() => window.open(`https://www.google.com/maps?q=${project.latitude},${project.longitude}`, '_blank')}
                  >
                    {translation("general.view_on_map")}
                  </Button>
                </div>
              ) : (
                <span className="text-primary">{translation("general.location_not_set")}</span>
              )}
            </TableCell>
          </  TableRow >
        </  TableBody >
      </Table>

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