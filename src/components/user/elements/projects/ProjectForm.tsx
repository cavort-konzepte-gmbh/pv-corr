import React, { useState } from "react";
import { Theme } from "../../../../types/theme";
import { Person } from "../../../../types/people";
import { Company } from "../../../../types/companies";
import { Plus } from "lucide-react";
import { addProject } from "../../../../services/projects";
import { Language, useTranslation } from "../../../../types/language";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/slices/hooks";

interface ProjectFormProps extends React.PropsWithChildren {
  currentTheme: Theme;
  savedPeople: Person[];
  savedCompanies: Company[];
  currentLanguage: Language;
  selectedCustomerId: string | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ currentTheme, savedPeople, savedCompanies, currentLanguage, selectedCustomerId }) => {
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [clientRef, setClientRef] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [typeProject, setTypeProject] = useState<"roof" | "field">("field");
  const [error, setError] = useState<string | null>(null);
  const [createDefaultField, setCreateDefaultField] = useState(true);
  const [defaultFieldName, setDefaultFieldName] = useState("Field 1");
  const [createDefaultZone, setCreateDefaultZone] = useState(true);
  const [defaultZoneName, setDefaultZoneName] = useState("Zone 1");
  const translation = useTranslation(currentLanguage);
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      setError(null);
      dispatch(
        addProject({
          project: {
            name: projectName.trim(),
            clientRef: clientRef.trim() || undefined,
            customerId: selectedCustomerId,
            latitude: latitude.trim() || undefined,
            longitude: longitude.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
            managerId: selectedManagerId,
            typeProject,
          },
          options: {
            createDefaultField,
            defaultFieldName: defaultFieldName.trim(),
            createDefaultZone,
            defaultZoneName: defaultZoneName.trim(),
          },
        }),
      );

      setShowForm(false);
      setProjectName("");
      setClientRef("");
      setLatitude("");
      setLongitude("");
      setImageUrl("");
      setSelectedManagerId(null);
      setTypeProject("field");
      setError(null);
    } catch (err) {
      console.error("Error creating project:", err);
      // Keep form open if there's an error
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  return (
    <>
      <Button className="mb-6" onClick={() => setShowForm(true)}>
        <Plus size={16} />
        {translation("project.add")}
      </Button>

      {showForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-card">
            <h3 className="text-lg mb-6 text-primary">{translation("project.new")}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="block text-sm mb-1">
                  {translation("project.name")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <Label className="block text-sm mb-1">{translation("project.manager")}</Label>
                <select
                  value={selectedManagerId || ""}
                  onChange={(e) => setSelectedManagerId(e.target.value || null)}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="">{translation("project.manager.not_assigned")}</option>
                  {savedPeople.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.title ? `${person.title} ` : ""}
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="block text-sm mb-1 text-secondary">{translation("project.type")}</Label>
                <select
                  value={typeProject}
                  onChange={(e) => setTypeProject(e.target.value as "roof" | "field")}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="field">{translation("project.type.field")}</option>
                  <option value="roof">{translation("project.type.roof")}</option>
                </select>
              </div>

              <div>
                <div className="space-y-4 mt-4 p-4 rounded bg-theme">
                  <h4 className="font-medium text-primary">Default Structure</h4>

                  <div className="flex items-center gap-2">
                    <Input
                      type="checkbox"
                      id="createDefaultField"
                      checked={createDefaultField}
                      onChange={(e) => setCreateDefaultField(e.target.checked)}
                      className="rounded border-theme"
                    />
                    <Label htmlFor="createDefaultField" className="text-sm text-primary">
                      Create default field
                    </Label>
                  </div>

                  {createDefaultField && (
                    <div>
                      <Input
                        type="text"
                        value={defaultFieldName}
                        onChange={(e) => setDefaultFieldName(e.target.value)}
                        placeholder="Field name"
                      />

                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="checkbox"
                          id="createDefaultZone"
                          checked={createDefaultZone}
                          onChange={(e) => setCreateDefaultZone(e.target.checked)}
                          className="rounded border-theme"
                        />
                        <Label htmlFor="createDefaultZone" className="text-sm text-primary">
                          Create default zone
                        </Label>
                      </div>

                      {createDefaultZone && (
                        <Input
                          type="text"
                          value={defaultZoneName}
                          onChange={(e) => setDefaultZoneName(e.target.value)}
                          placeholder="Zone name"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="block text-sm mb-1 text-secondary">{translation("project.client_ref")}</Label>
                <Input type="text" value={clientRef} onChange={(e) => setClientRef(e.target.value)} placeholder="Enter client reference" />
              </div>

              <div>
                <Label className="block text-sm mb-1 text-secondary">{translation("project.latitude")}</Label>
                <Input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Enter latitude" />
              </div>

              <div>
                <Label className="block text-sm mb-1 text-secondary">{translation("project.longitude")}</Label>
                <Input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Enter longitude" />
              </div>

              <div>
                <Label className="block text-sm mb-1 text-secondary">{translation("project.image_url")}</Label>
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL (e.g. https://images.unsplash.com/...)"
                />
              </div>

              {error && <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-card">{error}</div>}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setShowForm(false);
                    setProjectName("");
                  }}
                >
                  {translation("actions.cancel")}
                </Button>
                <Button type="submit">{translation("project.create")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectForm;
