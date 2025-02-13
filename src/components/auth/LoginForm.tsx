import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../types/theme';
import { LogIn } from 'lucide-react';

interface LoginFormProps {
  currentTheme: Theme;
  onSuccess: (type: 'user' | 'admin') => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ currentTheme, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
      
      // Check if this is an admin login attempt
      const adminLevel = user?.user_metadata?.admin_level;
      if (loginType === 'admin' && (!adminLevel || adminLevel === 'user')) {
        throw new Error('Invalid admin credentials');
      }

      // Pass the login type to onSuccess
      onSuccess(loginType);
    } catch (err) {
      let errorMessage = 'Invalid email or password';
      if (err instanceof Error && err.message === 'Invalid admin credentials') {
        errorMessage = 'Invalid admin credentials';
      }
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
      <div 
        className="max-w-sm w-full p-8 rounded-lg"
        style={{ backgroundColor: currentTheme.colors.surface }}
      >
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setLoginType('user')}
            className="flex-1 p-2 rounded font-medium transition-opacity text-sm"
            style={{ 
              backgroundColor: loginType === 'user' ? currentTheme.colors.accent.primary : 'transparent',
              color: loginType === 'user' ? 'white' : currentTheme.colors.text.secondary,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            User
          </button>
          <button
            onClick={() => setLoginType('admin')}
            className="flex-1 p-2 rounded font-medium transition-opacity text-sm"
            style={{ 
              backgroundColor: loginType === 'admin' ? currentTheme.colors.accent.primary : 'transparent',
              color: loginType === 'admin' ? 'white' : currentTheme.colors.text.secondary,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            Admin
          </button>
        </div>

        {error && (
          <div 
            className="p-4 mb-4 rounded text-sm"
            style={{ 
              backgroundColor: `${currentTheme.colors.accent.primary}20`,
              color: currentTheme.colors.accent.primary
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded text-sm"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${currentTheme.colors.border}`,
                color: currentTheme.colors.text.primary
              }}
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 rounded text-sm"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${currentTheme.colors.border}`,
                color: currentTheme.colors.text.primary
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 rounded font-medium transition-opacity disabled:opacity-50 text-sm"
            style={{ 
              backgroundColor: currentTheme.colors.accent.primary,
              color: 'white'
            }}
          >
            {loading ? 'Signing in...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;