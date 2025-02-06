import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../types/theme';
import { LogIn } from 'lucide-react';

interface LoginFormProps {
  currentTheme: Theme;
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ currentTheme, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
      <div 
        className="max-w-md w-full p-8 rounded-lg"
        style={{ backgroundColor: currentTheme.colors.surface }}
      >
        <div className="flex items-center justify-center mb-8">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: currentTheme.colors.accent.primary }}
          >
            <LogIn className="text-white" size={24} />
          </div>
        </div>

        <h2 
          className="text-2xl font-bold text-center mb-8"
          style={{ color: currentTheme.colors.text.primary }}
        >
          Sign in to your account
        </h2>

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
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded text-sm"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${currentTheme.colors.border}`,
                color: currentTheme.colors.text.primary
              }}
              placeholder="Enter your email"
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
              className="w-full p-3 rounded text-sm"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${currentTheme.colors.border}`,
                color: currentTheme.colors.text.primary
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded font-medium transition-opacity disabled:opacity-50"
            style={{ 
              backgroundColor: currentTheme.colors.accent.primary,
              color: 'white'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;