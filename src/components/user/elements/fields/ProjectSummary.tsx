import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Project } from '../../../../types/projects';
import { Person } from '../../../../types/people';
import { Company } from '../../../../types/companies';
import { Building2, MapPin, User, Mail, Phone, DoorOpen, Maximize2, Upload } from 'lucide-react';
import MediaDialog from '../../../shared/MediaDialog';


interface ProjectSummaryProps {
  project: Project;
  manager?: Person;
  company?: Company;
  currentTheme: Theme;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({
  project,
  manager,
  company,
  currentTheme
}) => {

  const [showMediaDialog, setShowMediaDialog] = useState<string | null>(null);




  return (
    <div className="p-6 rounded-lg mb-8 border-theme border-solid bg-surface">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5" style={{ color: currentTheme.primary }} />
          <span className="font-semibold">{project.name}</span>
        </div>
        {project.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <span>{project.location}</span>
          </div>
        )}
        {manager && (
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <span>{manager.name}</span>
          </div>
        )}
        {manager?.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <a href={`mailto:${manager.email}`} className="hover:underline">
              {manager.email}
            </a>
          </div>
        )}
        {manager?.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <a href={`tel:${manager.phone}`} className="hover:underline">
              {manager.phone}
            </a>
          </div>
        )}
        {company && (
          <div className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <span>{company.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Upload
            className="w-5 h-5 cursor-pointer"
            style={{ color: currentTheme.primary }}
            onClick={() => setShowMediaDialog(project.id) }
          />
          <span className="cursor-pointer" onClick={() => setShowMediaDialog(project.id)}>
          Media management 
          </span>
        </div>
       
      </div>
      {showMediaDialog && (
        <MediaDialog
          isOpen={true}
          onClose={() => setShowMediaDialog(null)}
          entityId={showMediaDialog}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
};

export default ProjectSummary;