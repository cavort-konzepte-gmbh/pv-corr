import { Folder } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { updateField } from "../../../../services/fields";
import { fetchProjects } from "../../../../services/projects";
import { Language, useTranslation } from "../../../../types/language";
import { isValidCoordinate, formatCoordinate } from "../../../../utils/coordinates";
import { AlertCircle } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";

interface EditFieldProps {
  field: {
    id: string;
    name: string;
    latitude: string;
    longitude: string;
    has_fence: string;
  };
  isEditingCoordinates: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  onProjectsChange: (projects: any[]) => void;
  currentLanguage: Language;
}

export const EditField = ({ field, isEditingCoordinates, setShowForm, onProjectsChange, currentLanguage }: EditFieldProps) => {
  const [fields, setFields] = useState(field);
  const translation = useTranslation(currentLanguage);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFields((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { id, ...data } = fields;
    
    // Validate coordinates if provided
    if ((data.latitude && !isValidCoordinate(data.latitude)) || 
        (data.longitude && !isValidCoordinate(data.longitude))) {
      // Show error but don't prevent saving - the UI will show validation errors
      console.error("Invalid coordinates format");
      return;
    }

    // Format coordinates if valid
    if (data.latitude && data.longitude && isValidCoordinate(data.latitude) && isValidCoordinate(data.longitude)) {
      data.latitude = formatCoordinate(data.latitude);
      data.longitude = formatCoordinate(data.longitude);
    }
    
    try {
      await updateField(id, data);
      const updatedProjects = await fetchProjects();
      onProjectsChange(updatedProjects);
    } catch (error) {
      console.error("Error updating field:", error);
    }
    setShowForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-6 rounded-lg max-w-md w-full bg-surface">
        <h3 className="flex gap-2 text-lg mb-4 text-primary">
          <Folder className="text-accent-primary" />
          {isEditingCoordinates ? "Edit Coordinates" : "Edit Field"}
        </h3>
        <form onSubmit={handleSubmit}>
          {!isEditingCoordinates && (
            <Label className="block text-sm mb-1 text-secondary" htmlFor="new-field">
              {translation("field.name")}
              <input
                className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                type="text"
                name="name"
                required
                value={fields.name}
                onChange={handleChange}
              />
            </Label>
          )}
          <Label className="block text-sm mb-1 text-secondary">
            {translation("project.latitude")}
            <input
              className={`w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface ${
                !isValidCoordinate(fields.latitude) && fields.latitude ? "border-destructive" : ""
              }`}
              type="text"
              name="latitude"
              value={fields.latitude}
              onChange={handleChange}
              placeholder="e.g., 57.123456"
              title="Enter decimal coordinates (e.g., 57.123456)"
            />
          </Label>
          <Label className="block text-sm mb-1 text-secondary">
            {translation("project.longitude")}
            <input
              className={`w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface ${
                !isValidCoordinate(fields.longitude) && fields.longitude ? "border-destructive" : ""
              }`}
              type="text"
              name="longitude"
              value={fields.longitude}
              onChange={handleChange}
              placeholder="e.g., 10.123456"
              title="Enter decimal coordinates (e.g., 10.123456)"
            />
          </Label>
          {(fields.latitude && !isValidCoordinate(fields.latitude)) || 
           (fields.longitude && !isValidCoordinate(fields.longitude)) ? (
            <div className="text-destructive flex items-center gap-1 text-xs mt-1">
              <AlertCircle size={12} />
              <span>Use decimal format (e.g., 57.123456)</span>
            </div>
          ) : null}
          {!isEditingCoordinates && (
            <div className="block text-sm mb-1 text-secondary">
              <Label>{translation("field.has_fence")}</Label>
              <select
                name="has_fence"
                value={fields.has_fence}
                onChange={handleChange}
                className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
              >
                <option value="no">{translation("field.has_fence.no")}</option>
                <option value="yes">{translation("field.has_fence.yes")}</option>
              </select>
            </div>
          )}
          <div className="w-full mt-6 flex items-center justify-end gap-x-2">
            <Button
              className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
              type="button"
              onClick={() => setShowForm(false)}
            >
              {translation("actions.cancel")}
            </Button>
            <Button className="px-4 py-2 rounded text-sm text-white bg-accent-primary" type="submit">
              {translation("actions.save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
