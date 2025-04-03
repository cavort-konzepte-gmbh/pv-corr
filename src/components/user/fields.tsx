import React, { useEffect } from "react";
import { Language, useTranslation } from "../../types/language";
import { Project } from "../../types/projects";
import { Person } from "../../types/people";
import { Company } from "../../types/companies";
import ProjectSummary from "./elements/fields/ProjectSummary";
import FieldList from "./elements/fields/FieldList";
import { useAppDispatch, useAppSelector } from "@/store/slices/hooks";
import { getAllFieldsByProjectId } from "@/services/fields";
import { selectAllFields } from "@/store/slices/fieldsSlice";

interface FieldsProps {
  currentLanguage: Language;
  projects: Project[];
  selectedProjectId?: string;
  selectedField: string | undefined;
  onSelectField: (projectId: string, fieldId: string) => void;
  people: Person[];
  companies: Company[];
  selectedCustomerId: string | null;
}

const Fields: React.FC<FieldsProps> = ({ projects, onSelectField, people, companies, currentLanguage }) => {
  const dispatch = useAppDispatch();
  const translation = useTranslation(currentLanguage);
  const { selectedProjectId } = useAppSelector((state) => state.navigation);
  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null;
  const projectIdle = useAppSelector((state) => state.projects.status);
  const fields = useAppSelector((state) => selectAllFields(state));

  useEffect(() => {
    if (projectIdle === "succeeded") {
      dispatch(getAllFieldsByProjectId());
    }
  }, [projectIdle]);

  if (!selectedProject) {
    return <div className="p-6 text-center text-secondary">{translation("field.select_project")}</div>;
  }

  const manager = people.find((person) => person.id === selectedProject.managerId);
  const company = companies.find((company) => company.id === selectedProject.companyId);

  return (
    <div className="p-6">
      <ProjectSummary
        project={selectedProject}
        manager={manager}
        company={company}
        currentLanguage={currentLanguage}
        savedPeople={people}
      />

      <FieldList
        fields={fields}
        onSelectField={(fieldId) => onSelectField(selectedProject.id, fieldId)}
        currentLanguage={currentLanguage}
        selectedProjectId={selectedProject.id}
      />
    </div>
  );
};

export default Fields;
