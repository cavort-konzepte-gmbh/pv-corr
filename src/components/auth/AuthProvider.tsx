import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../types/theme';
import LoginForm from './LoginForm';
import { fetchUserSettings } from '../../services/userSettings';

interface AuthContextType {
  user: any;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
  currentTheme: Theme;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, currentTheme }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Load user settings after successful authentication
        fetchUserSettings().then(settings => {
          if (settings) {
            // Update app state with user settings
            window.dispatchEvent(new CustomEvent('userSettingsLoaded', { detail: settings }));
          }
        });
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserSettings().then(settings => {
          if (settings) {
            window.dispatchEvent(new CustomEvent('userSettingsLoaded', { detail: settings }));
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div 
          className="text-sm"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm currentTheme={currentTheme} onSuccess={() => {}} />;
  }

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};