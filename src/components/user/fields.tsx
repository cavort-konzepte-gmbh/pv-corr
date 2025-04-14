import React from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { Project } from "../../types/projects";
import { Person } from "../../types/people";
import { Company } from "../../types/companies";
import ProjectSummary from "./elements/fields/ProjectSummary";
import FieldList from "./elements/fields/FieldList";
import { useEffect } from "react";
import { fetchProjects } from "../../services/projects";

interface FieldsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  selectedProjectId?: string;
  selectedField: string | undefined;
  onSelectField: (projectId: string, fieldId: string) => void;
  people: Person[];
  companies: Company[];
  selectedCustomerId: string | null;
}

const Fields: React.FC<FieldsProps> = ({
  currentTheme,
  projects,
  selectedProjectId,
  onSelectField,
  people,
  companies,
  onProjectsChange,
  currentLanguage,
  selectedCustomerId,
}) => {
  const translation = useTranslation(currentLanguage);

  // Refresh projects data when component mounts or when selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      const refreshProjects = async () => {
        try {
          const updatedProjects = await fetchProjects();
          if (updatedProjects) {
            onProjectsChange(updatedProjects);
          }
        } catch (err) {
          console.error("Error refreshing projects:", err);
        }
      };

      refreshProjects();
    }
  }, [selectedProjectId]);

  // Refresh projects data when component mounts or when selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      const refreshProjects = async () => {
        try {
          const updatedProjects = await fetchProjects();
          if (updatedProjects) {
            onProjectsChange(updatedProjects);
          }
        } catch (err) {
          console.error("Error refreshing projects:", err);
        }
      };

      refreshProjects();
    }
  }, [selectedProjectId]);

  // Safely find the selected project with error handling
  const selectedProject = (() => {
    try {
      if (!selectedProjectId || !projects || !Array.isArray(projects)) return null;
      return projects.find((p) => p && p.id === selectedProjectId) || null;
    } catch (err) {
      console.error("Error finding selected project:", err);
      return null;
    }
  })();

  if (!selectedProject) {
    return <div className="p-6 text-center text-secondary">{translation("field.select_project")}</div>;
  }

  // Safely find manager and company with error handling
  const manager = (() => {
    try {
      if (!people || !Array.isArray(people) || !selectedProject.managerId) return null;
      return people.find((person) => person && person.id === selectedProject.managerId) || null;
    } catch (err) {
      console.error("Error finding manager:", err);
      return null;
    }
  })();

  const company = (() => {
    try {
      if (!companies || !Array.isArray(companies) || !selectedProject.companyId) return null;
      return companies.find((company) => company && company.id === selectedProject.companyId) || null;
    } catch (err) {
      console.error("Error finding company:", err);
      return null;
    }
  })();

  return (
    <div className="p-6">
      <ProjectSummary
        project={selectedProject}
        manager={manager}
        company={company}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        savedPeople={people}
        onProjectsChange={onProjectsChange}
        selectedCustomerId={selectedCustomerId}
      />

      <FieldList
        currentTheme={currentTheme}
        fields={selectedProject.fields && Array.isArray(selectedProject.fields) ? selectedProject.fields : []}
        onSelectField={(fieldId) => onSelectField(selectedProject.id, fieldId)}
        onProjectsChange={onProjectsChange}
        currentLanguage={currentLanguage}
        selectedProjectId={selectedProject.id}
        selectedCustomerId={selectedCustomerId}
      />
    </div>
  );
};

export default Fields;
