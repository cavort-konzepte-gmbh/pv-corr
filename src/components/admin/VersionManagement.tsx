import React, { useState, useEffect } from "react";
import { Theme } from "../../types/theme";
import { ArrowLeft, Plus, Save, X, Tag, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getCurrentVersion, getAllVersions } from "../../services/versions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface VersionManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

interface Version {
  id: string;
  version: string;
  is_beta: boolean;
  link?: string;
  is_current: boolean;
  created_at: string;
  created_by?: string;
}

const VersionManagement: React.FC<VersionManagementProps> = ({ currentTheme, onBack }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formValues, setFormValues] = useState({
    major: 0,
    minor: 0,
    patch: 0,
    is_beta: false,
    link: "",
  });

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const allVersions = await getAllVersions();
      setVersions(allVersions);
    } catch (err) {
      console.error("Error loading versions:", err);
      setError("Failed to load versions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const versionString = `${formValues.major}.${formValues.minor}.${formValues.patch}`;
      
      const insertData = {
        version: versionString,
        major: formValues.major,
        minor: formValues.minor,
        patch: formValues.patch,
        is_beta: formValues.is_beta,
        is_current: true,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      // Only add link if it's not empty
      if (formValues.link.trim()) {
        insertData['link'] = formValues.link;
      }
      
      const { data, error } = await supabase
        .from("versions")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      await loadVersions();
      setShowNewForm(false);
      setFormValues({
        major: 0,
        minor: 0,
        patch: 0,
        is_beta: false,
        link: "",
      });
    } catch (err) {
      console.error("Error creating version:", err);
      setError("Failed to create version");
    }
  };

  const handleSetCurrent = async (versionId: string) => {
    try {
      // First set all versions to not current
      await supabase
        .from("versions")
        .update({ is_current: false })
        .not("id", "eq", versionId);
      
      // Then set the selected version to current
      const { error } = await supabase
        .from("versions")
        .update({ is_current: true })
        .eq("id", versionId);
      
      if (error) throw error;
      
      await loadVersions();
    } catch (err) {
      console.error("Error setting current version:", err);
      setError("Failed to set current version");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={onBack} variant="ghost">
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold">Version Management</h2>
      </div>

      {error && <div className="p-4 mb-4 rounded text-destructive-foreground border border-destructive bg-destructive/10">{error}</div>}

      <Button onClick={() => setShowNewForm(true)} className="w-full mb-6">
        <Plus size={16} />
        Add New Version
      </Button>

      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-card">
            <h3 className="text-lg mb-6 flex items-center gap-2">
              <Tag size={20} />
              New Version
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="block text-sm mb-1">
                    Major
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formValues.major}
                    onChange={(e) => setFormValues({ ...formValues, major: parseInt(e.target.value) })}
                    min={0}
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm mb-1">
                    Minor
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formValues.minor}
                    onChange={(e) => setFormValues({ ...formValues, minor: parseInt(e.target.value) })}
                    min={0}
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm mb-1">
                    Patch
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formValues.patch}
                    onChange={(e) => setFormValues({ ...formValues, patch: parseInt(e.target.value) })}
                    min={0}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="block text-sm mb-1">
                  Version Type
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    checked={formValues.is_beta}
                    onChange={(e) => setFormValues({ ...formValues, is_beta: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span>Beta Version</span>
                </div>
              </div>

              <div>
                <Label className="block text-sm mb-1">
                  Link (Optional)
                </Label>
                <Input
                  type="url"
                  value={formValues.link}
                  onChange={(e) => setFormValues({ ...formValues, link: e.target.value })}
                  placeholder="https://example.com/release-notes"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                  }}
                  variant="destructive"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Version
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="border border-input rounded-md bg-card">
        <div className="w-full relative overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-mono">{version.version}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10">
                      {version.is_beta ? "Beta" : "Stable"}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(version.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {version.link ? (
                      <a 
                        href={version.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent-primary hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {version.is_current ? (
                      <Check className="text-green-500" size={16} />
                    ) : (
                      <Button
                        onClick={() => handleSetCurrent(version.id)}
                        variant="ghost"
                        className="text-xs"
                      >
                        Set as Current
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!version.is_current && (
                        <Button
                          onClick={() => handleSetCurrent(version.id)}
                          variant="ghost"
                          className="text-xs"
                        >
                          Set as Current
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {versions.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No versions found. Create your first version.
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading versions...
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

export default VersionManagement;