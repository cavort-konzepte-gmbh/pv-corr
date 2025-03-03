import React from 'react';
import { Theme } from '../../../../types/theme';
import { Project, Zone } from '../../../../types/projects';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ProjectHeaderProps {
  project: Project;
  field: {
    name: string;
    latitude?: string;
    longitude?: string;
  };
  zone: Zone;
  onBack: () => void;
  currentTheme: Theme;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  field,
  zone,
  onBack,
  currentTheme
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <table className="w-full border-collapse rounded-lg border transition-all text-primary border-theme bg-surface mb-8">
      <thead>
        <tr>
          <th colSpan={2} className="p-4 text-left border-b font-semibold border-theme cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="p-2 rounded hover:bg-opacity-80 text-secondary"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {zone.name}
                  </div>
                  <div className="text-sm text-secondary">
                    {project.name} • {field.name}
                  </div>
                </div>
              </div>
              <ChevronDown className="text-secondary" size={16} />
            </div>
          </th>
        </tr>
      </thead>
      {isExpanded && (
        <tbody>
          <tr>
            <td className="p-2 border-r border-theme w-1/6 text-secondary">
              Project Type
            </td>
            <td className="p-2 border-theme">
              {project.typeProject}
            </td>
          </tr>
          <tr>
            <td className="p-2 border-r border-theme w-1/6 text-secondary">
              Project Manager
            </td>
            <td className="p-2 border-theme">
              {project.managerName || 'Not assigned'}
            </td>
          </tr>
          <tr>
            <td className="p-2 border-r border-theme w-1/6 text-secondary">
              Company
            </td>
            <td className="p-2 border-theme">
              {project.companyName || 'Not assigned'}
            </td>
          </tr>
          {project.managerEmail && (
            <tr>
              <td className="p-2 border-r border-theme w-1/6 text-secondary">
                Contact Email
              </td>
              <td className="p-2 border-theme">
                <a href={`mailto:${project.managerEmail}`} className="text-accent-primary hover:underline">
                  {project.managerEmail}
                </a>
              </td>
            </tr>
          )}
          {project.managerPhone && (
            <tr>
              <td className="p-2 border-r border-theme w-1/6 text-secondary">
                Contact Phone
              </td>
              <td className="p-2 border-theme">
                <a href={`tel:${project.managerPhone}`} className="text-accent-primary hover:underline">
                  {project.managerPhone}
                </a>
              </td>
            </tr>
          )}
        </tbody>
      )}
    </table>
  );
};

export default ProjectHeader;