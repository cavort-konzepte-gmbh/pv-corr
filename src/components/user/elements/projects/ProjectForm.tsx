import React, { useState } from "react";
import { Theme } from "../../../../types/theme";
import { Person } from "../../../../types/people";
import { Company } from "../../../../types/companies";
import { Plus, Users, Building2, MapPin, FileText, FolderPlus, Check } from "lucide-react";
import { createProject } from "../../../../services/projects";
import { fetchProjects } from "../../../../services/projects";
import { Language, useTranslation } from "../../../../types/language";
import { showToast } from "../../../../lib/toast";
import { isValidCoordinate, formatCoordinate } from "../../../../utils/coordinates";
import { Project } from "../../../../types/projects";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectFormProps extends React.PropsWithChildren {
  currentTheme: Theme;
  savedPeople: Person[];
  savedCompanies: Company[];
  onProjectsChange: (projects: Project[]) => void;
  currentLanguage: Language;
  selectedCustomerId: string | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  currentTheme,
  savedPeople,
  savedCompanies,
  currentLanguage,
  selectedCustomerId,
  onProjectsChange,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    clientRef: "",
    latitude: "",
    longitude: "",
    imageUrl: "",
    selectedManagerId: "none", // Changed from empty string to "none"
    typeProject: "field" as "roof" | "field",
    createDefaultField: true,
    defaultFieldName: "Field 1",
    createDefaultZone: true,
    defaultZoneName: "Zone 1"
  });
  const [error, setError] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      showToast("Project name is required", "error");
      return;
    }

    // Validate coordinates if provided
    if ((formData.latitude && !isValidCoordinate(formData.latitude)) || 
        (formData.longitude && !isValidCoordinate(formData.longitude))) {
      showToast("Coordinates must be in decimal format (e.g., 57.123456)", "error");
      return;
    }

    try {
      setError(null);
      
      // Format coordinates if valid
      let latitude = formData.latitude;
      let longitude = formData.longitude;
      
      if (latitude && longitude && isValidCoordinate(latitude) && isValidCoordinate(longitude)) {
        latitude = formatCoordinate(latitude);
        longitude = formatCoordinate(longitude);
      }
      
      const newProject = await createProject(
        {
          name: formData.projectName.trim(),
          clientRef: formData.clientRef.trim() || undefined,
          customerId: selectedCustomerId,
          latitude: latitude || undefined,
          longitude: longitude || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
          managerId: formData.selectedManagerId === "none" ? undefined : formData.selectedManagerId,
          typeProject: formData.typeProject,
        },
        {
          createDefaultField: formData.createDefaultField,
          defaultFieldName: formData.defaultFieldName.trim(),
          createDefaultZone: formData.createDefaultZone,
          defaultZoneName: formData.defaultZoneName.trim(),
        },
      );

      // Update projects list with new project
      const updatedProjects = await fetchProjects(selectedCustomerId as string);
      onProjectsChange(updatedProjects);

      // If the new project has an ID, navigate to it
      if (newProject && newProject.id) {
        // Wait a moment to ensure the database has completed all operations
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh projects again to ensure we have the latest data including fields and zones
        const refreshedProjects = await fetchProjects(selectedCustomerId as string);
        onProjectsChange(refreshedProjects);
      }

      setShowForm(false);
      setFormData({
        projectName: "",
        clientRef: "",
        latitude: "",
        longitude: "",
        imageUrl: "",
        selectedManagerId: "none", // Reset to "none" instead of empty string
        typeProject: "field",
        createDefaultField: true,
        defaultFieldName: "Field 1",
        createDefaultZone: true,
        defaultZoneName: "Zone 1"
      });
      setError(null);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  return (
    <>
      <Button onClick={() => setShowForm(true)} className="w-full mt-4 flex items-center gap-2">
        <FolderPlus size={16} />
        {translation("project.add")}
      </Button>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-primary" />
              {translation("project.new")}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-sm font-medium">
                  {translation("project.name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange("projectName", e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectManager" className="text-sm font-medium">
                    {translation("project.manager")}
                  </Label>
                  <Select 
                    value={formData.selectedManagerId} 
                    onValueChange={(value) => handleInputChange("selectedManagerId", value)}
                  >
                    <SelectTrigger id="projectManager" className="w-full">
                      <SelectValue placeholder={translation("project.manager.not_assigned")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {translation("project.manager.not_assigned")}
                      </SelectItem>
                      {savedPeople.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.title ? `${person.title} ` : ""}
                          {person.firstName} {person.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectType" className="text-sm font-medium">
                    {translation("project.type")}
                  </Label>
                  <Select 
                    value={formData.typeProject} 
                    onValueChange={(value) => handleInputChange("typeProject", value as "roof" | "field")}
                  >
                    <SelectTrigger id="projectType" className="w-full">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="field">{translation("project.type.field")}</SelectItem>
                      <SelectItem value="roof">{translation("project.type.roof")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Default Structure</CardTitle>
                  <CardDescription>Configure initial project structure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="createDefaultField" 
                      checked={formData.createDefaultField}
                      onCheckedChange={(checked) => handleInputChange("createDefaultField", !!checked)}
                    />
                    <Label htmlFor="createDefaultField" className="text-sm font-medium">
                      Create default field
                    </Label>
                  </div>
                  
                  {formData.createDefaultField && (
                    <div className="pl-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultFieldName" className="text-sm font-medium">Field name</Label>
                        <Input
                          id="defaultFieldName"
                          value={formData.defaultFieldName}
                          onChange={(e) => handleInputChange("defaultFieldName", e.target.value)}
                          placeholder="Field name"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="createDefaultZone" 
                          checked={formData.createDefaultZone}
                          onCheckedChange={(checked) => handleInputChange("createDefaultZone", !!checked)}
                        />
                        <Label htmlFor="createDefaultZone" className="text-sm font-medium">
                          Create default zone
                        </Label>
                      </div>
                      
                      {formData.createDefaultZone && (
                        <div className="pl-6 space-y-2">
                          <Label htmlFor="defaultZoneName" className="text-sm font-medium">Zone name</Label>
                          <Input
                            id="defaultZoneName"
                            value={formData.defaultZoneName}
                            onChange={(e) => handleInputChange("defaultZoneName", e.target.value)}
                            placeholder="Zone name"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientRef" className="text-sm font-medium">
                    {translation("project.client_ref")}
                  </Label>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientRef"
                      value={formData.clientRef}
                      onChange={(e) => handleInputChange("clientRef", e.target.value)}
                      placeholder="Enter client reference"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm font-medium">
                    {translation("project.image_url")}
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm font-medium">
                    {translation("project.latitude")}
                  </Label>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      id="latitude"
                      value={formData.latitude}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange("latitude", value);
                      }}
                      placeholder="Enter latitude"
                      title="Enter decimal coordinates (e.g., 57.123456)"
                      className={!isValidCoordinate(formData.latitude) && formData.latitude ? "border-destructive" : ""}
                      placeholder="e.g., 57.123456"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm font-medium">
                    {translation("project.longitude")}
                  </Label>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      id="longitude"
                      value={formData.longitude}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange("longitude", value);
                      }}
                      placeholder="Enter longitude"
                      title="Enter decimal coordinates (e.g., 10.123456)"
                      className={!isValidCoordinate(formData.longitude) && formData.longitude ? "border-destructive" : ""}
                      placeholder="e.g., 10.123456"
                    />
                  </div>
                </div>
                
                {(formData.latitude && !isValidCoordinate(formData.latitude)) || 
                 (formData.longitude && !isValidCoordinate(formData.longitude)) ? (
                  <div className="col-span-2 text-destructive flex items-center gap-1 text-xs mt-1">
                    <AlertCircle size={12} />
                    <span>Coordinates must be in decimal format (e.g., 57.123456, 10.123456)</span>
                  </div>
                ) : null}
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    projectName: "",
                    clientRef: "",
                    latitude: "",
                    longitude: "",
                    imageUrl: "",
                    selectedManagerId: "none", // Reset to "none" instead of empty string
                    typeProject: "field",
                    createDefaultField: true,
                    defaultFieldName: "Field 1",
                    createDefaultZone: true,
                    defaultZoneName: "Zone 1"
                  });
                }}
              >
                {translation("actions.cancel")}
              </Button>
              <Button type="submit">
                {translation("project.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectForm;