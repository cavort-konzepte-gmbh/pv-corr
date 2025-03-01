import React from 'react';
import { Theme } from '../../types/theme';
import { Users, Database, Settings, LogOut, BellRing } from 'lucide-react';
import DatabaseManagement from './DatabaseManagement';
import UserManagement from './UserManagement';
import AdminSettings from './AdminSettings';
import NotificationsPanel from './notifications/NotificationsPanel';
import { supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  currentTheme: Theme;
  currentLanguage: Language;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentTheme, currentLanguage }) => {
  const [activeView, setActiveView] = React.useState<'overview' | 'database' | 'users' | 'notifications' | 'settings'>('overview');
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // The AuthProvider will handle the redirect after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-theme">
      {activeView === 'database' ? (
        <DatabaseManagement 
          currentTheme={currentTheme} 
          currentLanguage={currentLanguage}
          onBack={() => setActiveView('overview')} 
        />
      ) : activeView === 'users' ? (
        <UserManagement 
          currentTheme={currentTheme} 
          onBack={() => setActiveView('overview')} 
        />
      ) : activeView === 'settings' ? (
        <AdminSettings
          currentTheme={currentTheme}
          onBack={() => setActiveView('overview')}
        />
      ) : activeView === 'notifications' ? (
        <NotificationsPanel
          currentTheme={currentTheme}
          onBack={() => setActiveView('overview')}
        />
      ) : (
        <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Admin Dashboard
          </h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors text-primary"
            style={{ 
              backgroundColor: `${currentTheme.colors.accent.primary}20`,
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Management */}
          <div 
            onClick={() => setActiveView('users')}
            className="p-6 rounded-lg bg-surface"
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Users className="text-accent-primary" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-primary">
                  User Management
                </h3>
                <p className="text-sm text-secondary">
                  Manage user accounts
                </p>
              </div>
            </div>
          </div>

          {/* Database Management */}
          <div 
            onClick={() => setActiveView('database')}
            className="p-6 rounded-lg bg-surface"
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Database className="text-accent-primary" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-primary">
                  Database
                </h3>
                <p className="text-sm text-secondary">
                  Manage database records
                </p>
              </div>
            </div>
          </div>

          {/* Notifications Management */}
          <div 
            onClick={() => setActiveView('notifications')}
            className="p-6 rounded-lg bg-surface"
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <BellRing className="text-accent-primary" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-primary">
                  Notifications
                </h3>
                <p className="text-sm text-secondary">
                  Manage notifications
                </p>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div 
            onClick={() => setActiveView('settings')}
            className="p-6 rounded-lg bg-surface"
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Settings className="text-accent-primary" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-primary">
                  Settings
                </h3>
                <p className="text-sm text-secondary">
                  System configuration
                </p>
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