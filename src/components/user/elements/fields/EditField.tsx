import { Folder } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { updateField } from "../../../../services/fields";
import { fetchProjects } from "../../../../services/projects";

interface EditFieldProps {
  field: {
    id: string,
    name: string;
    latitude: string;
    longitude: string;
    has_fence: string;
  };
  isEditingCoordinates: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  onProjectsChange: (projects: any[]) => void;
}

export const EditField = ({ field, isEditingCoordinates, setShowForm, onProjectsChange }: EditFieldProps) => {
  const [fields, setFields] = useState(field);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFields((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { id, ...data } = fields
    try {
      await updateField(id, data)
      const updatedProjects = await fetchProjects()
      onProjectsChange(updatedProjects)
    } catch(error) {
      console.error('Error updating field:', error)
    }
    setShowForm(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-6 rounded-lg max-w-md w-full bg-surface">
        <h3 className="flex gap-2 text-lg mb-4 text-primary">
          <Folder className="text-accent-primary" />
          { isEditingCoordinates ? "Edit Coordinates" : "Edit Field"}
        </h3>
        <form onSubmit={handleSubmit}>
          {!isEditingCoordinates && (
            <label
              className="block text-sm mb-1 text-secondary"
              htmlFor="new-field"
            >
              Field Name
              <input
                className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                type="text"
                name="name"
                required
                value={fields.name}
                onChange={handleChange}
              />
            </label>
          )}
          <label className="block text-sm mb-1 text-secondary">
            Latitude
            <input
              className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
              type="text"
              name="latitude"
              value={fields.latitude}
              onChange={handleChange}
            />
          </label>
          <label className="block text-sm mb-1 text-secondary">
            Longitude
            <input
              className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
              type="text"
              name="longitude"
              value={fields.longitude}
              onChange={handleChange}
            />
          </label>
          {!isEditingCoordinates && (
            <div className="block text-sm mb-1 text-secondary">
              <label>Has Fence</label>
              <select
                name="has_fence"
                value={fields.has_fence}
                onChange={handleChange}
                className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          )}
          <div className="w-full mt-6 flex items-center justify-end gap-x-2">
            <button
              className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
              type="submit"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
