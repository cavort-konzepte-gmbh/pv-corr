import React from "react";
import { Theme } from "../../types/theme";
import { Users, Database, Settings, LogOut, BellRing } from "lucide-react";
import DatabaseManagement from "./DatabaseManagement";
import UserManagement from "./UserManagement";
import AdminSettings from "./AdminSettings";
import NotificationsPanel from "./notifications/NotificationsPanel";
import { Language } from "../../types/language";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";

interface AdminDashboardProps {
  currentTheme: Theme;
  currentLanguage: Language;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentTheme, currentLanguage }) => {
  const [activeView, setActiveView] = React.useState<"overview" | "database" | "users" | "notifications" | "settings">("overview");

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Force page reload to clear any cached state
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {activeView === "database" ? (
        <DatabaseManagement currentTheme={currentTheme} currentLanguage={currentLanguage} onBack={() => setActiveView("overview")} />
      ) : activeView === "users" ? (
        <UserManagement currentTheme={currentTheme} onBack={() => setActiveView("overview")} />
      ) : activeView === "settings" ? (
        <AdminSettings currentTheme={currentTheme} onBack={() => setActiveView("overview")} />
      ) : activeView === "notifications" ? (
        <NotificationsPanel currentTheme={currentTheme} onBack={() => setActiveView("overview")} />
      ) : (
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-card-foreground">Admin Dashboard</h1>
            <Button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors">
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Management */}
            <div
              onClick={() => setActiveView("users")}
              className="p-6 rounded-lg text-card-foreground border border-accent bg-card hover:cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Users className="text-accent-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-medium">User Management</h3>
                  <p className="text-sm text-muted-foreground">Manage user accounts</p>
                </div>
              </div>
            </div>

            {/* Database Management */}
            <div
              onClick={() => setActiveView("database")}
              className="p-6 rounded-lg text-card-foreground border border-accent bg-card hover:cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Database className="text-accent-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Database</h3>
                  <p className="text-sm text-muted-foreground">Manage database records</p>
                </div>
              </div>
            </div>

            {/* Notifications Management */}
            <div
              onClick={() => setActiveView("notifications")}
              className="p-6 rounded-lg text-card-foreground border border-accent bg-card hover:cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <BellRing className="text-accent-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Manage notifications</p>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div
              onClick={() => setActiveView("settings")}
              className="p-6 rounded-lg text-card-foreground border border-accent bg-card hover:cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Settings className="text-accent-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Settings</h3>
                  <p className="text-sm text-muted-foreground">System configuration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
