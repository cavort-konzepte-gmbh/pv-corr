import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { Language, useTranslation } from "../../types/language";
import { supabase } from "../../lib/supabase";
import { Plus, Edit2, Save, X, ArrowUpDown } from "lucide-react";
import { generateHiddenId } from "../../utils/generateHiddenId";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface MaterialsPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
}

type SortField = "name" | "e_potential" | "valency" | "molar_mass";
type SortDirection = "asc" | "desc";

interface Material {
  id: string;
  hidden_id: string;
  name: string;
  e_potential: number | null;
  valency: number | null;
  molar_mass: number | null;
}

export const MaterialsPanel: React.FC<MaterialsPanelProps> = ({ currentTheme, currentLanguage }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isNewMaterial, setIsNewMaterial] = useState<boolean>(false);
  const [newMaterial, setNewMaterial] = useState<Record<string, string>>({});
  const t = useTranslation(currentLanguage);

  useEffect(() => {
    loadData();
  }, []);

  // Sort materials based on current sort field and direction
  const sortedMaterials = React.useMemo(() => {
    if (!materials) return [];
    
    return [...materials].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "e_potential":
          const aEPot = a.e_potential !== null ? Number(a.e_potential) : -Infinity;
          const bEPot = b.e_potential !== null ? Number(b.e_potential) : -Infinity;
          comparison = aEPot - bEPot;
          break;
        case "valency":
          const aValency = a.valency !== null ? Number(a.valency) : -Infinity;
          const bValency = b.valency !== null ? Number(b.valency) : -Infinity;
          comparison = aValency - bValency;
          break;
        case "molar_mass":
          const aMass = a.molar_mass !== null ? Number(a.molar_mass) : -Infinity;
          const bMass = b.molar_mass !== null ? Number(b.molar_mass) : -Infinity;
          comparison = aMass - bMass;
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [materials, sortField, sortDirection]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("materials").select("*").order("created_at", { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      console.error("Error loading materials:", err);
      setError("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEditingValues = (name: string, value: string) => {
    setEditingValues((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleChangeMaterial = (name: string, value: string) => {
    setNewMaterial((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetValues = () => {
    setEditingValues({});
    setEditingMaterial(null);
  };

  const handleUpdateSaveMaterial = async (material: Material) => {
    if (editingMaterial === material.id) {
      try {
        // Validate numeric fields
        const e_potential = editingValues.e_potential ? parseFloat(editingValues.e_potential) : null;
        const valency = editingValues.valency ? parseFloat(editingValues.valency) : null;
        const molar_mass = editingValues.molar_mass ? parseFloat(editingValues.molar_mass) : null;

        const { error } = await supabase
          .from("materials")
          .update({
            name: editingValues.name,
            e_potential,
            valency,
            molar_mass,
          })
          .eq("id", material.id);

        if (error) throw error;
        await loadData();
        resetValues();
      } catch (err) {
        console.error("Error updating material:", err);
        setError("Failed to update material");
      }
    } else {
      setEditingMaterial(material.id);
      setEditingValues(material as any);
      setNewMaterial({});
      setIsNewMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase.from("materials").delete().eq("id", materialId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error("Error deleting material:", err);
      setError("Failed to delete material");
    }
  };

  const handleOpenMaterial = () => {
    resetValues();
    setIsNewMaterial(true);
  };

  const handleAddNewMaterial = async () => {
    try {
      // Validate numeric fields
      const e_potential = newMaterial.e_potential ? parseFloat(newMaterial.e_potential) : null;
      const valency = newMaterial.valency ? parseFloat(newMaterial.valency) : null;
      const molar_mass = newMaterial.molar_mass ? parseFloat(newMaterial.molar_mass) : null;

      const { error } = await supabase.from("materials").insert({
        name: newMaterial.name,
        e_potential,
        valency,
        molar_mass,
        hidden_id: generateHiddenId(),
      });

      if (error) throw error;
      await loadData();
      resetValues();
      setNewMaterial({});
      setIsNewMaterial(false);
    } catch (err) {
      console.error("Error creating material:", err);
      setError("Failed to create material");
    }
  };

  const handleCancelNewMaterial = () => {
    resetValues();
    setNewMaterial({});
    setIsNewMaterial(false);
  };

  return (
    <div className="p-6">
      {error && <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>}

      {loading ? (
        <div className="text-center p-4 text-primary">Loading materials...</div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Materials</h3>
            <Button onClick={handleOpenMaterial} className="px-3 py-1">
              <Plus size={14} />
              Add Material
            </Button>
          </div>

          <section className="border border-input rounded-md bg-card">
            <div className="w-full relative overflow-auto">
              <Table>
                <TableCaption className="h-8">Materials</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSortChange("name")}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        {sortField === "name" ? (
                          <span className="text-xs ml-1">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        ) : (
                          <ArrowUpDown size={14} className="ml-1 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSortChange("e_potential")}
                    >
                      <div className="flex items-center gap-1">
                        E-Potential
                        {sortField === "e_potential" ? (
                          <span className="text-xs ml-1">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        ) : (
                          <ArrowUpDown size={14} className="ml-1 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSortChange("valency")}
                    >
                      <div className="flex items-center gap-1">
                        Valency
                        {sortField === "valency" ? (
                          <span className="text-xs ml-1">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        ) : (
                          <ArrowUpDown size={14} className="ml-1 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSortChange("molar_mass")}
                    >
                      <div className="flex items-center gap-1">
                        Molar Mass
                        {sortField === "molar_mass" ? (
                          <span className="text-xs ml-1">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        ) : (
                          <ArrowUpDown size={14} className="ml-1 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="p-2">
                        {editingMaterial === material.id ? (
                          <Input
                            type="text"
                            name="name"
                            value={editingValues.name || ""}
                            onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                            className="w-full p-1"
                          />
                        ) : (
                          material.name
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        {editingMaterial === material.id ? (
                          <Input
                            type="number"
                            name="e_potential"
                            value={editingValues.e_potential || ""}
                            onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                            className="w-full p-1"
                            step="any"
                          />
                        ) : (
                          material.e_potential
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        {editingMaterial === material.id ? (
                          <Input
                            type="number"
                            name="valency"
                            value={editingValues.valency || ""}
                            onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                            className="w-full p-1"
                            step="any"
                          />
                        ) : (
                          material.valency
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        {editingMaterial === material.id ? (
                          <Input
                            type="number"
                            name="molar_mass"
                            value={editingValues.molar_mass || ""}
                            onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                            className="w-full p-1"
                            step="any"
                          />
                        ) : (
                          material.molar_mass
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleUpdateSaveMaterial(material)}
                            className="p-1 rounded hover:bg-opacity-80"
                            variant="ghost"
                          >
                            {editingMaterial === material.id ? <Save size={14} /> : <Edit2 size={14} />}
                          </Button>
                          <Button onClick={() => handleDeleteMaterial(material.id)} variant="ghost">
                            <X size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {isNewMaterial && (
                    <TableRow>
                      <TableCell className="p-2">
                        <Input
                          type="text"
                          name="name"
                          value={newMaterial.name || ""}
                          onChange={(e) => handleChangeMaterial(e.target.name, e.target.value)}
                          className="w-full p-1"
                          placeholder="Enter material name"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          name="e_potential"
                          value={newMaterial.e_potential || ""}
                          onChange={(e) => handleChangeMaterial(e.target.name, e.target.value)}
                          className="w-full p-1"
                          placeholder="Enter E-Potential"
                          step="any"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          name="valency"
                          value={newMaterial.valency || ""}
                          onChange={(e) => handleChangeMaterial(e.target.name, e.target.value)}
                          className="w-full p-1"
                          placeholder="Enter Valency"
                          step="any"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          name="molar_mass"
                          value={newMaterial.molar_mass || ""}
                          onChange={(e) => handleChangeMaterial(e.target.name, e.target.value)}
                          className="w-full p-1"
                          placeholder="Enter Molar Mass"
                          step="any"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button onClick={handleAddNewMaterial} className="p-1 rounded hover:bg-opacity-80 text-primary" variant="ghost">
                            <Save size={14} />
                          </Button>
                          <Button
                            onClick={handleCancelNewMaterial}
                            className="p-1 rounded hover:bg-opacity-80 text-primary"
                            variant="ghost"
                          >
                            <X className="text-primary" size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
