import React from 'react';
import { Theme } from '../../../../types/theme';
import { Project, Zone } from '../../../../types/projects';
import { ArrowLeft, ChevronDown, Table } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2} className="p-4 text-left border-b font-semibold border-theme cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={onBack}
                  className="p-2 rounded hover:bg-opacity-80 text-secondary"
                >
                  <ArrowLeft size={20} />
                </Button>
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
          </TableHead>
        </TableRow>
        </TableHeader>
  
      {isExpanded && (
           <TableBody>
          <TableRow>
            <TableCell className="p-2 border-r border-theme w-1/6 text-secondary">
              Project Type
            </TableCell>
            <TableCell className="p-2 border-theme">
              {project.typeProject}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="p-2 border-r border-theme w-1/6 text-secondary">
              Project Manager
            </TableCell>
            <TableCell className="p-2 border-theme">
              {project.managerName || 'Not assigned'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="p-2 border-r border-theme w-1/6 text-secondary">
              Company
            </TableCell>
            <TableCell className="p-2 border-theme">
              {project.companyName || 'Not assigned'}
            </TableCell>
          </TableRow>
          {project.managerEmail && (
            <TableRow>
              <TableCell className="p-2 border-r border-theme w-1/6 text-secondary">
                Contact Email
              </TableCell>
              <TableCell className="p-2 border-theme">
                <a href={`mailto:${project.managerEmail}`} className="text-accent-primary hover:underline">
                  {project.managerEmail}
                </a>
              </TableCell>
            </TableRow>
          )}
          {project.managerPhone && (
            <TableRow>
              <TableCell className="p-2 border-r border-theme w-1/6 text-secondary">
                Contact Phone
              </TableCell>
              <TableCell className="p-2 border-theme">
                <a href={`tel:${project.managerPhone}`} className="text-accent-primary hover:underline">
                  {project.managerPhone}
                </a>
              </TableCell>
            </TableRow>
          )}
   </TableBody>
      )}

  </Table>
  );
};

export default ProjectHeader;