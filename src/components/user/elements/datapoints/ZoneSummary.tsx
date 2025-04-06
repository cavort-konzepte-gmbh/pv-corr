import React, { useState } from "react";
import { Theme } from "../../../../types/theme";
import { Zone } from "../../../../types/projects";
import { Edit2, Save, X, ChevronDown, ChevronRight } from "lucide-react";
import { Language, useTranslation } from "../../../../types/language";
import { updateZone } from "../../../../services/zones";
import { fetchProjects } from "../../../../services/projects";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ZoneSummaryProps {
  zone: Zone;
  currentTheme: Theme;
  currentLanguage: Language;
  onProjectsChange: (projects: any[]) => void;
}

const ZoneSummary: React.FC<ZoneSummaryProps> = ({ zone, currentTheme, currentLanguage, onProjectsChange }) => {
  const translation = useTranslation(currentLanguage);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editValues, setEditValues] = useState({
    name: zone.name,
    latitude: zone.latitude || "",
    longitude: zone.longitude || "",
  });

  const handleSave = async () => {
    try {
      await updateZone(zone.id, editValues);
      const updatedProjects = await fetchProjects();
      onProjectsChange(updatedProjects);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating zone:", err);
    }
  };

  return (
    <div className="mb-8">
      <section className="border border-input rounded-md bg-card">
        <div className="w-full relative overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  colSpan={2}
                  className="p-4 text-left border-b font-semibold border-accent"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="p-1 rounded text-sm text-primary "
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span>{zone.name}</span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-opacity-20 bg-border">
                          {zone.datapoints?.length || 0} {translation("datapoints").toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave();
                            }}
                            className="p-1 rounded hover:bg-opacity-80 text-secondary"
                          >
                            <Save size={14} />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditing(false);
                            }}
                            className="p-1 rounded hover:bg-opacity-80 text-secondary"
                          >
                            <X size={14} />
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                          }}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          <Edit2 size={14} />
                        </Button>
                      )}
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            {isExpanded && (
              <TableBody>
                <TableRow>
                  <TableCell className="p-2  w-1/6">{translation("zones.location")}</TableCell>
                  <TableCell className="p-2 ">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={editValues.latitude}
                          onChange={(e) => setEditValues({ ...editValues, latitude: e.target.value })}
                          className="w-1/2 p-1 rounded text-sm text-primary "
                          placeholder={translation("project.latitude")}
                        />
                        <Input
                          type="text"
                          value={editValues.longitude}
                          onChange={(e) => setEditValues({ ...editValues, longitude: e.target.value })}
                          className="w-1/2 p-1 rounded text-sm text-primary "
                          placeholder={translation("project.longitude")}
                        />
                      </div>
                    ) : zone.latitude && zone.longitude ? (
                      <div className="flex items-center justify-between">
                        <span>
                          {zone.latitude}, {zone.longitude}
                        </span>
                        <Button
                          onClick={() => window.open(`https://www.google.com/maps?q=${zone.latitude},${zone.longitude}`, "_blank")} 
                          className="text-sm hover:underline"
                        >
                          {translation("general.view_on_map")}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{translation("general.location_not_set")}</span>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </div>
      </section>
    </div>
  );
};

export default ZoneSummary;