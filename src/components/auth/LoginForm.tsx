import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../types/theme';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

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
      const adminLevel = user?.user_metadata?.admin_level || 'user';
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
    <div className="min-h-screen flex items-center justify-center  ">
      <div className="max-w-sm w-full p-8 rounded-lg border border-accent bg-background">
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setLoginType('user')}
            className={`flex-1 p-2 rounded font-medium transition-opacity text-sm  ${
              loginType === 'user'
                 ? 'text-primary-foreground hover:bg-theme' 
                : ' bg-accent-primary text-primary'
            }`}
          >
            User
          </Button>
          <Button
            onClick={() => setLoginType('admin')}
            className={`flex-1 p-2 rounded font-medium transition-opacity text-sm  ${
              loginType === 'admin'
                  ? 'text-primary-foreground hover:bg-theme' 
                : ' bg-accent-primary text-primary'
            }`}
          >
            Admin
          </Button>
        </div>

        {error && (
          <div 
            className="p-4 mb-4 rounded text-sm text-primary"
      
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2 ">
              Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded text-sm   "              
              placeholder="name@company.com"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2 ">
              Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 rounded text-sm "            
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full p-2 rounded font-medium " 
                       
          >
            {loading ? 'Signing in...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;