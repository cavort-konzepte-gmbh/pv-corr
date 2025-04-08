import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, Plus, Edit2, X, Save, ArrowUpDown } from "lucide-react";
import { generateHiddenId } from "../../utils/generateHiddenId";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface FoundationsManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

type SortField = "name" | "created_at";
type SortDirection = "asc" | "desc";

interface Foundation {
  id: string;
  hidden_id: string;
  name: string;
  created_at?: string;
}

const FoundationsManagement: React.FC<FoundationsManagementProps> = ({ currentTheme, onBack }) => {
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingFoundation, setEditingFoundation] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isNewFoundation, setIsNewFoundation] = useState(false);
  const [newFoundation, setNewFoundation] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  // Sort foundations based on current sort field and direction
  const sortedFoundations = React.useMemo(() => {
    if (!foundations) return [];
    
    return [...foundations].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "created_at":
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          comparison = aDate - bDate;
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [foundations, sortField, sortDirection]);

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
      const { data, error } = await supabase.from("foundations").select("*").order("created_at", { ascending: true });

      if (error) throw error;
      setFoundations(data || []);
    } catch (err) {
      console.error("Error loading foundations:", err);
      setError("Failed to load foundations");
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

  const handleChangeFoundation = (name: string, value: string) => {
    setNewFoundation((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetValues = () => {
    setEditingValues({});
    setEditingFoundation(null);
  };

  const handleUpdateSaveFoundation = async (foundation: Foundation) => {
    if (editingFoundation === foundation.id) {
      try {
        const { error } = await supabase
          .from("foundations")
          .update({
            name: editingValues.name,
          })
          .eq("id", foundation.id);

        if (error) throw error;
        await loadData();
        resetValues();
      } catch (err) {
        console.error("Error updating foundation:", err);
        setError("Failed to update foundation");
      }
    } else {
      setEditingFoundation(foundation.id);
      setEditingValues(foundation as any);
      setNewFoundation({});
      setIsNewFoundation(false);
    }
  };

  const handleDeleteFoundation = async (foundationId: string) => {
    try {
      const { error } = await supabase.from("foundations").delete().eq("id", foundationId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error("Error deleting foundation:", err);
      setError("Failed to delete foundation");
    }
  };

  const handleOpenFoundation = () => {
    resetValues();
    setIsNewFoundation(true);
  };

  const handleAddNewFoundation = async () => {
    try {
      if (!newFoundation.name?.trim()) {
        setError("Foundation name is required");
        return;
      }

      const { error } = await supabase.from("foundations").insert({
        name: newFoundation.name.trim(),
        hidden_id: generateHiddenId(),
      });

      if (error) throw error;
      await loadData();
      resetValues();
      setNewFoundation({});
      setIsNewFoundation(false);
    } catch (err) {
      console.error("Error creating foundation:", err);
      setError("Failed to create foundation");
    }
  };

  const handleCancelNewFoundation = () => {
    resetValues();
    setNewFoundation({});
    setIsNewFoundation(false);
  };

  return (
    <div className="p-8">
      {error && <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>}

      <div className="flex items-center gap-4 mb-8">
        <Button onClick={onBack} variant="ghost">
          <ArrowLeft className="text-primary" size={20} />
        </Button>
        <h2 className="text-2xl font-bold">Foundations Management</h2>
      </div>

      {loading ? (
        <div className="text-center p-4 text-primary">Loading foundations...</div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg text-primary">Foundations</h3>
            <Button onClick={handleOpenFoundation} className="px-3 py-1">
              <Plus size={14} />
              Add Foundation
            </Button>
          </div>
          <section className="border border-input rounded-md bg-card">
            <div className="w-full relative overflow-auto">
              <Table>
                <TableCaption className="h-8">Foundations</TableCaption>
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
                      onClick={() => handleSortChange("created_at")}
                    >
                      <div className="flex items-center gap-1">
                        Created
                        {sortField === "created_at" ? (
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
                  {sortedFoundations.map((foundation) => (
                    <TableRow key={foundation.id}>
                      <TableCell className="p-2">
                        {editingFoundation === foundation.id ? (
                          <Input
                            type="text"
                            name="name"
                            value={editingValues.name || ""}
                            onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          />
                        ) : (
                          foundation.name
                        )}
                      </TableCell>
                      <TableCell className="p-2 text-muted-foreground text-sm">
                        {foundation.created_at ? new Date(foundation.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center justify-start gap-2">
                          <Button
                            onClick={() => handleUpdateSaveFoundation(foundation)}
                            className="p-1 rounded hover:bg-opacity-80"
                            variant="ghost"
                          >
                            {editingFoundation === foundation.id ? <Save size={14} /> : <Edit2 size={14} />}
                          </Button>
                          <Button onClick={() => handleDeleteFoundation(foundation.id)} variant="ghost">
                            <X size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {isNewFoundation && (
                    <TableRow>
                      <TableCell className="p-2">
                        <Input
                          type="text"
                          name="name"
                          value={newFoundation.name || ""}
                          onChange={(e) => handleChangeFoundation(e.target.name, e.target.value)}
                          className="w-full p-1"
                          placeholder="Enter foundation name"
                        />
                      </TableCell>
                      <TableCell className="p-2 text-muted-foreground text-sm">
                        -
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center justify-start gap-2">
                          <Button onClick={handleAddNewFoundation} variant="ghost">
                            <Save size={14} />
                          </Button>
                          <Button onClick={handleCancelNewFoundation} variant="ghost">
                            <X size={14} />
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

export default FoundationsManagement;
