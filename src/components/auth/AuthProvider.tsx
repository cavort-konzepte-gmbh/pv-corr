import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../types/theme';
import LoginForm from './LoginForm';
import LandingPage from './LandingPage';
import AdminDashboard from '../admin/AdminDashboard';
import { Language, setTranslations } from '../../types/language';
import { fetchTranslations } from '../../services/translations';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: any;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  loginType: 'user' | 'admin' | null;
  viewMode: 'user' | 'admin';
  toggleViewMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: async () => {},
  isAdmin: false,
  loginType: null,
  viewMode: 'user',
  toggleViewMode: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
  currentTheme: Theme;
  currentLanguage: Language;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, currentTheme, currentLanguage }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [loginType, setLoginType] = useState<'user' | 'admin' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    // Load translations when language changes
    const loadTranslations = async () => {
      const translations = await fetchTranslations(currentLanguage);
      setTranslations(translations);
    };
    loadTranslations();
  }, [currentLanguage]);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setViewMode('user');
        setShowLanding(true);
      } else if (session?.user) {
        handleSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = (session: Session | null) => {
    if (session?.user) {
      const metadata = session.user.user_metadata || {};

      // Set user and admin status
      setUser(session.user);
      setIsAdmin(metadata.admin_level === 'admin' || metadata.admin_level === 'super_admin');

      // Dispatch settings event with complete metadata
      window.dispatchEvent(
        new CustomEvent('userSettingsLoaded', {
          detail: metadata,
        }),
      );

      // Apply theme from metadata
      const themeId = metadata.theme_id || 'zinc';
      const split = themeId.split('.');
      document.documentElement.setAttribute('data-theme', split[0]);
      if (split[1]) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setLoginType(null);
      setShowLanding(true);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'user' ? 'admin' : 'user'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme">
        <div className="text-sm text-secondary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <LandingPage currentTheme={currentTheme} onContinue={() => setShowLanding(false)} />;
    }
    return <LoginForm currentTheme={currentTheme} onSuccess={(type) => setLoginType(type)} />;
  }

  // Show admin dashboard for admin users who logged in through admin login
  if (isAdmin && (loginType === 'admin' || viewMode === 'admin')) {
    return <AdminDashboard currentTheme={currentTheme} currentLanguage={currentLanguage} />;
  }

  return <AuthContext.Provider value={{ user, signOut, isAdmin, loginType, viewMode, toggleViewMode }}>{children}</AuthContext.Provider>;
};
