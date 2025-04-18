import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, Plus, Edit2, Save, X, ArrowUpDown } from "lucide-react";
import { FormHandler } from "../shared/FormHandler";
import { useKeyAction } from "../../hooks/useKeyAction";
import { generateHiddenId } from "../../utils/generateHiddenId";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ExpertsManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

type SortField = "name" | "website" | "email" | "phone" | "vat_id" | "registration_number";
type SortDirection = "asc" | "desc";

interface Expert {
  id: string;
  hidden_id: string;
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  vat_id?: string;
  registration_number?: string;
}

const ExpertsManagement: React.FC<ExpertsManagementProps> = ({ currentTheme, onBack }) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingExpert, setEditingExpert] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<Expert>>({});
  const [isNewExpert, setIsNewExpert] = useState(false);
  const [newExpert, setNewExpert] = useState<Partial<Expert>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  // Sort experts based on current sort field and direction
  const sortedExperts = React.useMemo(() => {
    if (!experts) return [];

    return [...experts].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "website":
          comparison = (a.website || "").localeCompare(b.website || "");
          break;
        case "email":
          comparison = (a.email || "").localeCompare(b.email || "");
          break;
        case "phone":
          comparison = (a.phone || "").localeCompare(b.phone || "");
          break;
        case "vat_id":
          comparison = (a.vat_id || "").localeCompare(b.vat_id || "");
          break;
        case "registration_number":
          comparison = (a.registration_number || "").localeCompare(b.registration_number || "");
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [experts, sortField, sortDirection]);

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
      const { data, error } = await supabase.from("experts").select("*").order("created_at", { ascending: true });

      if (error) throw error;
      setExperts(data || []);
    } catch (err) {
      console.error("Error loading experts:", err);
      setError("Failed to load experts");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEditingValues = (field: keyof Expert, value: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeNewExpert = (field: keyof Expert, value: string) => {
    setNewExpert((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetValues = () => {
    setEditingValues({});
    setEditingExpert(null);
  };

  const handleUpdateSaveExpert = async (expert: Expert) => {
    if (editingExpert === expert.id) {
      try {
        if (!editingValues.name?.trim()) {
          setError("Name is required");
          return;
        }

        const { error } = await supabase.from("experts").update(editingValues).eq("id", expert.id);

        if (error) throw error;
        await loadData();
        resetValues();
      } catch (err) {
        console.error("Error updating expert:", err);
        setError("Failed to update expert");
      }
    } else {
      setEditingExpert(expert.id);
      setEditingValues(expert);
      setNewExpert({});
      setIsNewExpert(false);
    }
  };

  const handleAddNewExpert = async () => {
    try {
      if (!newExpert.name?.trim()) {
        setError("Name is required");
        return;
      }

      const expertData = {
        ...newExpert,
        hidden_id: generateHiddenId(),
      };

      const { error } = await supabase.from("experts").insert(expertData);

      if (error) throw error;

      await loadData();
      resetValues();
      setNewExpert({});
      setIsNewExpert(false);
    } catch (err) {
      console.error("Error saving expert:", err);
      setError("Failed to save expert");
    }
  };

  const handleCancelNewExpert = () => {
    resetValues();
    setNewExpert({});
    setIsNewExpert(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("experts").delete().eq("id", id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error("Error deleting expert:", err);
      setError("Failed to delete expert");
    }
  };

  useKeyAction(
    () => {
      if (editingExpert) {
        handleUpdateSaveExpert(experts.find((e) => e.id === editingExpert)!);
      }
    },
    editingExpert !== null || isNewExpert,
    "Enter",
    500,
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={onBack} className="p-2 rounded hover:bg-opacity-80" variant="ghost">
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold">Experts Management</h2>
      </div>

      {error && <div className="p-4 mb-4 rounded">{error}</div>}

      <Button onClick={() => setIsNewExpert(true)} className="w-full">
        <Plus size={16} />
        Add New Expert
      </Button>

      <section className="mt-8 border border-input rounded-md bg-card">
        <div className="w-full relative overflow-auto">
          <Table>
            <TableCaption>Experts</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSortChange("name")}>
                  <div className="flex items-center gap-1">
                    Name
                    {sortField === "name" ? (
                      <span className="text-xs ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    ) : (
                      <ArrowUpDown size={14} className="ml-1 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSortChange("website")}>
                  <div className="flex items-center gap-1">
                    Website
                    {sortField === "website" ? (
                      <span className="text-xs ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    ) : (
                      <ArrowUpDown size={14} className="ml-1 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSortChange("email")}>
                  <div className="flex items-center gap-1">
                    Email
                    {sortField === "email" ? (
                      <span className="text-xs ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    ) : (
                      <ArrowUpDown size={14} className="ml-1 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSortChange("phone")}>
                  <div className="flex items-center gap-1">
                    Phone
                    {sortField === "phone" ? (
                      <span className="text-xs ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    ) : (
                      <ArrowUpDown size={14} className="ml-1 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSortChange("vat_id")}>
                  <div className="flex items-center gap-1">
                    VAT ID
                    {sortField === "vat_id" ? (
                      <span className="text-xs ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    ) : (
                      <ArrowUpDown size={14} className="ml-1 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSortChange("registration_number")}>
                  <div className="flex items-center gap-1">
                    Reg. No.
                    {sortField === "registration_number" ? (
                      <span className="text-xs ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    ) : (
                      <ArrowUpDown size={14} className="ml-1 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExperts.map((expert) => (
                <TableRow key={expert.id}>
                  <TableCell className="p-2">
                    {editingExpert === expert.id ? (
                      <FormHandler
                        isEditing={true}
                        onSave={() => handleUpdateSaveExpert(expert)}
                        onCancel={() => {
                          setEditingExpert(null);
                          setEditingValues({});
                        }}
                      >
                        <Input value={editingValues.name || ""} onChange={(e) => handleChangeEditingValues("name", e.target.value)} />
                      </FormHandler>
                    ) : (
                      expert.name
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    {editingExpert === expert.id ? (
                      <Input
                        type="url"
                        value={editingValues.website || ""}
                        onChange={(e) => handleChangeEditingValues("website", e.target.value)}
                      />
                    ) : (
                      expert.website || "-"
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    {editingExpert === expert.id ? (
                      <Input
                        type="email"
                        value={editingValues.email || ""}
                        onChange={(e) => handleChangeEditingValues("email", e.target.value)}
                      />
                    ) : (
                      expert.email || "-"
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    {editingExpert === expert.id ? (
                      <Input
                        type="tel"
                        value={editingValues.phone || ""}
                        onChange={(e) => handleChangeEditingValues("phone", e.target.value)}
                      />
                    ) : (
                      expert.phone || "-"
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    {editingExpert === expert.id ? (
                      <Input
                        type="text"
                        value={editingValues.vat_id || ""}
                        onChange={(e) => handleChangeEditingValues("vat_id", e.target.value)}
                      />
                    ) : (
                      expert.vat_id || "-"
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    {editingExpert === expert.id ? (
                      <Input
                        type="text"
                        value={editingValues.registration_number || ""}
                        onChange={(e) => handleChangeEditingValues("registration_number", e.target.value)}
                      />
                    ) : (
                      expert.registration_number || "-"
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex items-center justify-center gap-2">
                      <Button onClick={() => handleUpdateSaveExpert(expert)} className="p-1 rounded hover:bg-opacity-80" variant="ghost">
                        {editingExpert === expert.id ? <Save size={14} /> : <Edit2 size={14} />}
                      </Button>
                      {!editingExpert && (
                        <Button onClick={() => handleDelete(expert.id)} className="p-1 rounded hover:bg-opacity-80" variant="ghost">
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {isNewExpert && (
                <TableRow>
                  <TableCell className="p-2">
                    <FormHandler isEditing={true} onSave={handleAddNewExpert} onCancel={handleCancelNewExpert}>
                      <Input
                        type="text"
                        value={newExpert.name || ""}
                        onChange={(e) => handleChangeNewExpert("name", e.target.value)}
                        placeholder="Enter expert name"
                      />
                    </FormHandler>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="url"
                      value={newExpert.website || ""}
                      onChange={(e) => handleChangeNewExpert("website", e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="email"
                      value={newExpert.email || ""}
                      onChange={(e) => handleChangeNewExpert("email", e.target.value)}
                      placeholder="Enter email"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="tel"
                      value={newExpert.phone || ""}
                      onChange={(e) => handleChangeNewExpert("phone", e.target.value)}
                      placeholder="Enter phone"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="text"
                      value={newExpert.vat_id || ""}
                      onChange={(e) => handleChangeNewExpert("vat_id", e.target.value)}
                      placeholder="Enter VAT ID"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="text"
                      value={newExpert.registration_number || ""}
                      onChange={(e) => handleChangeNewExpert("registration_number", e.target.value)}
                      placeholder="Enter reg. no."
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex items-center justify-center gap-2">
                      <Button onClick={handleAddNewExpert} variant="ghost">
                        <Save size={14} />
                      </Button>
                      <Button onClick={handleCancelNewExpert} variant="ghost">
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
  );
};

export default ExpertsManagement;
