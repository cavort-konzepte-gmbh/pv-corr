import React from 'react';
import { Theme } from '../../types/theme';
import { Users, Database, Settings, Shield, LogOut } from 'lucide-react';
import DatabaseManagement from './DatabaseManagement';
import UserManagement from './UserManagement';
import { supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  currentTheme: Theme;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentTheme }) => {
  const [activeView, setActiveView] = React.useState<'overview' | 'database' | 'users' | 'security' | 'settings'>('overview');
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // The AuthProvider will handle the redirect after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
      {activeView === 'database' ? (
        <DatabaseManagement 
          currentTheme={currentTheme} 
          onBack={() => setActiveView('overview')} 
        />
      ) : activeView === 'users' ? (
        <UserManagement 
          currentTheme={currentTheme} 
          onBack={() => setActiveView('overview')} 
        />
      ) : (
        <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 
            className="text-2xl font-bold"
            style={{ color: currentTheme.colors.text.primary }}
          >
            Admin Dashboard
          </h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors"
            style={{ 
              backgroundColor: `${currentTheme.colors.accent.primary}20`,
              color: currentTheme.colors.accent.primary
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
            className="p-6 rounded-lg"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Users size={20} style={{ color: currentTheme.colors.accent.primary }} />
              </div>
              <div>
                <h3 
                  className="font-medium"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  User Management
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Manage user accounts
                </p>
              </div>
            </div>
          </div>

          {/* Database Management */}
          <div 
            onClick={() => setActiveView('database')}
            className="p-6 rounded-lg"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Database size={20} style={{ color: currentTheme.colors.accent.primary }} />
              </div>
              <div>
                <h3 
                  className="font-medium"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  Database
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Manage database records
                </p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div 
            onClick={() => setActiveView('security')}
            className="p-6 rounded-lg"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Shield size={20} style={{ color: currentTheme.colors.accent.primary }} />
              </div>
              <div>
                <h3 
                  className="font-medium"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  Security
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Security settings
                </p>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div 
            onClick={() => setActiveView('settings')}
            className="p-6 rounded-lg"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Settings size={20} style={{ color: currentTheme.colors.accent.primary }} />
              </div>
              <div>
                <h3 
                  className="font-medium"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  Settings
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
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