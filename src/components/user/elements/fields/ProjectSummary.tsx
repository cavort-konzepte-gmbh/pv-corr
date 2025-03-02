import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Project } from '../../../../types/projects';
import { Person } from '../../../../types/people';
import { Company } from '../../../../types/companies';
import { Building2, MapPin, User, Mail, Phone, DoorOpen, Maximize2, Upload } from 'lucide-react';
import MediaDialog from '../../../shared/MediaDialog';
import { useSupabaseMedia, fetchMediaUrlsByEntityId } from '../../../../services/media';

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
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState<number | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const { mediaUrl, uploadMedia, loading: isUploading } = useSupabaseMedia("projects-fields");
  const [preview, setPreview] = useState<string | null>(null);

  const handleShowMediaDialog = async (index: number, projectId: string) => {
    setShowMediaDialog(0);
    const mediatwo = await fetchMediaUrlsByEntityId(projectId);
    setMediaUrls(mediatwo);
  };

  const handleFileChangeInDialog = async (event: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPreview(URL.createObjectURL(file));
      await uploadMedia(file, projectId);
      const mediatwo = await fetchMediaUrlsByEntityId(projectId);
      setMediaUrls(mediatwo);
    }
  };

  return (
    <div className="p-6 rounded-lg mb-8 border-theme border-solid bg-surface">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-accent-primary">
          <Building2 className="w-5 h-5" />
          <span className="font-semibold">{project.name}</span>
        </div>
        {project.location && (
          <div className="flex items-center gap-2 text-accent-primary">
            <MapPin className="w-5 h-5" />
            <span>{project.location}</span>
          </div>
        )}
        {manager && (
          <div className="flex items-center gap-2 text-accent-primary">
            <User className="w-5 h-5" />
            <span>{manager.name}</span>
          </div>
        )}
        {manager?.email && (
          <div className="flex items-center gap-2 text-accent-primary">
            <Mail className="w-5 h-5" />
            <a href={`mailto:${manager.email}`} className="hover:underline">
              {manager.email}
            </a>
          </div>
        )}
        {manager?.phone && (
          <div className="flex items-center gap-2 text-accent-primary">
            <Phone className="w-5 h-5" />
            <a href={`tel:${manager.phone}`} className="hover:underline">
              {manager.phone}
            </a>
          </div>
        )}
        {company && (
          <div className="flex items-center gap-2 text-accent-primary">
            <DoorOpen className="w-5 h-5" />
            <span>{company.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-accent-primary">
          <Upload
            className="w-5 h-5 cursor-pointer"
            onClick={() => handleShowMediaDialog(0, project.id)}
          />
          <span className="cursor-pointer" onClick={() => handleShowMediaDialog(0, project.id)}>
            Upload Media
          </span>
        </div>
        {mediaUrls.length > 0 && (
          <div className="flex items-center gap-2">
            <Maximize2
              className="w-5 h-5 cursor-pointer"
              style={{ color: currentTheme.primary }}
              onClick={() => setShowFullscreenImage(true)}
            />
            <span className="cursor-pointer" onClick={() => setShowFullscreenImage(true)}>
              View Media
            </span>
          </div>
        )}
      </div>
      {showMediaDialog !== null && (
        <MediaDialog
          show={showMediaDialog !== null}
          onClose={() => setShowMediaDialog(null)}
          mediaUrls={mediaUrls}
          onFileChange={(e) => handleFileChangeInDialog(e, project.id)}
          preview={preview}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};

export default ProjectSummary;