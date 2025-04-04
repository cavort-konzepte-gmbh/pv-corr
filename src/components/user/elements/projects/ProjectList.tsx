import React, { useState } from "react";
import { Theme } from "../../../../types/theme";
import { Project } from "../../../../types/projects";
import { ChevronRight, Edit2, Save, Trash2 } from "lucide-react";
import { Language, useTranslation } from "../../../../types/language";
import { Customer } from "../../../../types/customers";
import { Folder } from "lucide-react";
import { Person } from "../../../../types/people";
import { setProject, removeProject } from "../../../../services/projects";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/slices/hooks";
import { selectAllProjects } from "@/store/slices/projectsSlice";

interface ProjectListProps {
  currentTheme: Theme;
  savedPeople: Person[];
  customers: Customer[];
  selectedCustomerId: string | null;
  onMoveProject: (projectId: string, customerId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  currentLanguage: Language;
}

const ProjectList: React.FC<ProjectListProps> = ({
  currentTheme,
  savedPeople,
  customers,
  selectedCustomerId,
  onMoveProject,
  onSelectProject,
  currentLanguage,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const translation = useTranslation(currentLanguage);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => selectAllProjects(state.projects));

  const handleSaveProject = async (project: Project) => {
    try {
      dispatch(
        setProject({
          ...project,
          ...editingValues,
        }),
      ).unwrap();
      setEditingProject(null);
      setEditingValues({});
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setError(null);
      dispatch(removeProject(projectId));
      setEditingProject(null);
      setEditingValues({});
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete project";
      setError(message);
      console.error("Error deleting project:", message);
    }
  };

  const handleSelectProject = (projectId: string) => {
    if (editingProject === projectId) return;
    onSelectProject(projectId);
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>}
      {projects &&
        projects.map((project) => (
          <div key={project.id} className="relative">
            <section className="border border-input rounded-md bg-card">
              <div className="w-full relative overflow-auto">
                <Table onClick={() => handleSelectProject(project.id)}>
                  <TableHeader>
                    <TableRow>
                      <TableHead colSpan={2} className="p-4 text-left border-b font-semibold border-accent">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Folder className="text-primary" size={16} />
                            <div className="flex items-center gap-4">
                              <span>{project.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 bg-border">{project.typeProject}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 bg-border">
                                  {project.fields.length} {translation("fields")}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 bg-border">
                                  {project.fields.reduce((acc, field) => acc + field.zones.length, 0)} {translation("zones")}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 bg-border">
                                  {project.fields.reduce(
                                    (acc, field) => acc + field.zones.reduce((zAcc, zone) => zAcc + (zone.datapoints?.length || 0), 0),
                                    0,
                                  )}{" "}
                                  {translation("datapoints")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {editingProject === project.id ? (
                              <>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveProject(project);
                                  }}
                                  className="p-1 rounded hover:bg-opacity-80"
                                >
                                  <Save size={14} />
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project.id);
                                  }}
                                  className="p-1 rounded hover:bg-opacity-80"
                                >
                                  <Trash2 size={14} />
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMoveMenu(showMoveMenu === project.id ? null : project.id);
                                  }}
                                  className="px-2 py-1 text-xs rounded hover:bg-opacity-80 text-white bg-accent-primary"
                                >
                                  Move
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProject(project.id);
                                  setEditingValues({
                                    managerId: project.managerId,
                                    latitude: project.latitude,
                                    longitude: project.longitude,
                                    typeProject: project.typeProject,
                                  });
                                }}
                                className="size-8 p-1 rounded hover:bg-opacity-80"
                              >
                                <Edit2 size={14} />
                              </Button>
                            )}
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="p-2 border-b border-r border-accent w-1/6">{translation("project.manager")}</TableCell>
                      <TableCell className="p-2 border-b border-accent">
                        {editingProject === project.id ? (
                          <select
                            value={editingValues.managerId || ""}
                            onChange={(e) => setEditingValues({ ...editingValues, managerId: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full p-1 rounded text-sm text-primary border border-input shadow-sm bg-accent"
                          >
                            <option value="">{translation("project.manager.not_assigned")}</option>
                            {savedPeople.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.firstName} {person.lastName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>
                            {savedPeople?.find((p) => p.id === project.managerId)
                              ? `${savedPeople?.find((p) => p.id === project.managerId)?.firstName} ${savedPeople?.find((p) => p.id === project.managerId)?.lastName}`
                              : translation("project.manager.not_assigned")}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="p-2 border-r border-accent w-1/6">{translation("zones.location")}</TableCell>
                      <TableCell className="p-2">
                        {editingProject === project.id ? (
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={editingValues.latitude || project.latitude || ""}
                              onChange={(e) => setEditingValues({ ...editingValues, latitude: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              className="w-1/2 p-1"
                              placeholder={translation("project.latitude")}
                            />
                            <Input
                              type="text"
                              value={editingValues.longitude || project.longitude || ""}
                              onChange={(e) => setEditingValues({ ...editingValues, longitude: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              className="w-1/2 p-1"
                              placeholder={translation("project.longitude")}
                            />
                          </div>
                        ) : project.latitude && project.longitude ? (
                          <div className="flex items-center justify-between">
                            <span>
                              {project.latitude}, {project.longitude}
                            </span>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/maps?q=${project.latitude},${project.longitude}`, "_blank");
                              }}
                              className="text-sm hover:underline"
                            >
                              {translation("general.view_on_map")}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-secondary">{translation("general.location_not_set")}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>
            {showMoveMenu === project.id && (
              <div className="mt-4 space-y-2">
                {selectedCustomerId && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveProject(project.id, null);
                      setShowMoveMenu(null);
                    }}
                    className="w-full p-2 text-left rounded hover:bg-opacity-10 text-sm"
                  >
                    Move to No Customer
                  </Button>
                )}
                {customers
                  .filter((c) => c.id !== selectedCustomerId)
                  .map((customer) => (
                    <Button
                      key={customer.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveProject(project.id, customer.id);
                        setShowMoveMenu(null);
                      }}
                      className="w-full p-2 text-left rounded hover:bg-opacity-10 text-sm"
                    >
                      Move to {customer.name}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default ProjectList;
