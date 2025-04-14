import React from "react";
import { Theme } from "../../types/theme";
import { ArrowLeft, Palette, Globe, ChevronLeft, Tag } from "lucide-react";
import ThemeManagement from "./ThemeManagement";
import TranslationsPanel from "./settings/TranslationsPanel";
import VersionManagement from "./VersionManagement";
import { Button } from "../ui/button";

interface AdminSettingsProps {
  currentTheme: Theme;
  onBack: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ currentTheme, onBack }) => {
  const [activeView, setActiveView] = React.useState<"overview" | "themes" | "translations" | "versions">("overview");

  return (
    <div className="p-8">
      {activeView !== "overview" ? (
        <div className="flex items-center gap-4 mb-8">
          {/* <Button
            variant="ghost"
            onClick={() => setActiveView('overview')}
          >
            <ChevronLeft size={20} />
            <span>System Configuration</span>
          </Button> */}
        </div>
      ) : (
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-2xl font-bold">System Configuration</h2>
        </div>
      )}

      {activeView === "themes" ? (
        <ThemeManagement currentTheme={currentTheme} onBack={() => setActiveView("overview")} />
      ) : activeView === "translations" ? (
        <TranslationsPanel currentTheme={currentTheme} currentLanguage="en" onBack={() => setActiveView("overview")} />
      ) : activeView === "versions" ? (
        <VersionManagement currentTheme={currentTheme} onBack={() => setActiveView("overview")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Theme Management */}
          {/* <div 
            onClick={() => setActiveView('themes')}
            className="p-6 rounded-lg border border-accent text-card-foreground hover:bg-opacity-80 transition-colors cursor-pointer"
          >
            <div className="flex flex-col gap-2">
              <Palette className="text-primary" size={24} />
              <h3 className="text-lg font-medium mt-2">
                Theme Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage system themes
              </p>
            </div>
          </div>
 */}
          {/* Translations Management */}
          <div
            onClick={() => setActiveView("translations")}
            className="p-6 rounded-lg border border-accent text-card-foreground hover:bg-opacity-80 transition-colors cursor-pointer bg-card"
          >
            <div className="flex flex-col gap-2">
              <Globe className="text-accent-primary" size={24} />
              <h3 className="text-lg font-medium mt-2">Translations Management</h3>
              <p className="text-sm text-muted-foreground">Manage system translations</p>
            </div>
          </div>

          {/* Version Management */}
          <div
            onClick={() => setActiveView("versions")}
            className="p-6 rounded-lg border transition-all hover:translate-x-1 text-card-foreground border-accent hover:cursor-pointer bg-card"
          >
            <div className="flex flex-col gap-2">
              <Tag className="text-accent-primary" size={24} />
              <h3 className="text-lg font-medium mt-2">Version Management</h3>
              <p className="text-sm text-muted-foreground">Manage application versions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
