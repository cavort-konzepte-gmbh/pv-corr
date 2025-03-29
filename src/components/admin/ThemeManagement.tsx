import React, { useState } from "react";
import { Theme, THEMES } from "../../types/theme";
import { Palette, Plus, Edit2, X, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface ThemeManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

interface ThemeData {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    accent: {
      primary: string;
      hover: string;
    };
  };
}

const ThemeManagement: React.FC<ThemeManagementProps> = ({ currentTheme, onBack }) => {
  const [themes, setThemes] = useState<ThemeData[]>(THEMES);
  const [editingTheme, setEditingTheme] = useState<string | null>(null);
  const [themeForm, setThemeForm] = useState<ThemeData | null>(null);
  const [showNewThemeForm, setShowNewThemeForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditTheme = (theme: ThemeData) => {
    setThemeForm(theme);
    setEditingTheme(theme.id);
  };

  const handleNewTheme = () => {
    setThemeForm({
      id: "",
      name: "",
      colors: {
        background: "#000000",
        surface: "#111111",
        border: "#222222",
        text: {
          primary: "#ffffff",
          secondary: "#999999",
          accent: "#ffffff",
        },
        accent: {
          primary: "#0066cc",
          hover: "#0055aa",
        },
      },
    });
    setShowNewThemeForm(true);
  };

  const handleSaveTheme = async () => {
    if (!themeForm) return;

    try {
      const { error } = await supabase.from("themes").upsert({
        id: themeForm.id || undefined,
        name: themeForm.name,
        colors: themeForm.colors,
      });

      if (error) throw error;

      // Refresh themes list
      const { data: updatedThemes } = await supabase.from("themes").select("*");

      if (updatedThemes) {
        setThemes(updatedThemes);
      }

      setEditingTheme(null);
      setShowNewThemeForm(false);
      setThemeForm(null);
    } catch (err) {
      console.error("Error saving theme:", err);
      setError("Failed to save theme");
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    try {
      const { error } = await supabase.from("themes").delete().eq("id", themeId);

      if (error) throw error;

      // Remove theme from local state
      setThemes((prev) => prev.filter((t) => t.id !== themeId));
    } catch (err) {
      console.error("Error deleting theme:", err);
      setError("Failed to delete theme");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={onBack} className="p-2 rounded hover:bg-opacity-80 text-secondary" variant="ghost">
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold text-primary">Theme Management</h2>
      </div>

      {error && <div className="p-4 mb-4 rounded text-primary border-theme border-solid bg-surface">{error}</div>}

      <Button onClick={handleNewTheme} className="mb-6 px-4 py-2 rounded text-sm flex items-center gap-2 text-white bg-accent-primary">
        <Plus size={16} />
        Add New Theme
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div key={theme.id} className="p-6 rounded-lg border-theme border-solid bg-surface">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-primary">
                  <Palette size={16} style={{ color: "white" }} />
                </div>
                <div>
                  <h3 className="font-medium text-primary">{theme.name}</h3>
                  <p className="text-sm text-secondary">{theme.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => handleEditTheme(theme)} className="p-1 rounded hover:bg-opacity-80 text-secondary" variant="ghost">
                  <Edit2 size={16} />
                </Button>
                {theme.id !== currentTheme.id && (
                  <Button
                    onClick={() => handleDeleteTheme(theme.id)}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    variant="ghost"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 h-2 rounded bg-theme" />
              <div className="flex-1 h-2 rounded" />
              <div className="flex-1 h-2 rounded" />
              <div className="flex-1 h-2 rounded" />
            </div>
          </div>
        ))}
      </div>

      {(editingTheme || showNewThemeForm) && themeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg max-w-2xl w-full bg-surface">
            <h3 className="text-lg mb-6 text-primary">{editingTheme ? "Edit Theme" : "New Theme"}</h3>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm mb-1 text-secondary">Theme Name</Label>
                <Input
                  type="text"
                  value={themeForm.name}
                  onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-theme"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm mb-1 text-secondary">Background Color</Label>
                  <Input
                    type="color"
                    value={themeForm.colors.background}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        colors: { ...themeForm.colors, background: e.target.value },
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-1 text-secondary">Surface Color</Label>
                  <Input
                    type="color"
                    value={themeForm.colors.surface}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        colors: { ...themeForm.colors, surface: e.target.value },
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-1 text-secondary">Border Color</Label>
                  <Input
                    type="color"
                    value={themeForm.colors.border}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        colors: { ...themeForm.colors, border: e.target.value },
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-1 text-secondary">Primary Text Color</Label>
                  <Input
                    type="color"
                    value={themeForm.colors.text.primary}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        colors: {
                          ...themeForm.colors,
                          text: { ...themeForm.colors.text, primary: e.target.value },
                        },
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-1 text-secondary">Secondary Text Color</Label>
                  <Input
                    type="color"
                    value={themeForm.colors.text.secondary}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        colors: {
                          ...themeForm.colors,
                          text: { ...themeForm.colors.text, secondary: e.target.value },
                        },
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-1 text-secondary">Accent Text Color</Label>
                  <Input
                    type="color"
                    value={themeForm.colors.text.accent}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        colors: {
                          ...themeForm.colors,
                          text: { ...themeForm.colors.text, accent: e.target.value },
                        },
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-1 text-secondary">Primary Accent Color</Label>
                  <Input
                    type="color"
                    value={themeForm.colors.accent.primary}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        colors: {
                          ...themeForm.colors,
                          accent: { ...themeForm.colors.accent, primary: e.target.value },
                        },
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-1 text-secondary">Hover Accent Color</Label>
                  <Input
                    type="color"
                    value={themeForm.colors.accent.hover}
                    onChange={(e) =>
                      setThemeForm({
                        ...themeForm,
                        colors: {
                          ...themeForm.colors,
                          accent: { ...themeForm.colors.accent, hover: e.target.value },
                        },
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={() => {
                    setEditingTheme(null);
                    setShowNewThemeForm(false);
                    setThemeForm(null);
                  }}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTheme} className="px-4 py-2 rounded text-sm text-white bg-accent-primary">
                  {editingTheme ? "Save Changes" : "Create Theme"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeManagement;
