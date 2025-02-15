import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { supabase } from '../../lib/supabase';
import { Shield, User, Search, Edit2, Save, X, ArrowLeft } from 'lucide-react';

interface UserManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  admin_level: 'super_admin' | 'admin' | 'user';
  created_at: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentTheme, onBack }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'admin' | 'user'>('user');

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_management')
        .select('*');

      if (error) throw error;

      const formattedUsers = data.map(user => ({
        id: user.id,
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || user.email,
        admin_level: (user.admin_level || 'user') as 'super_admin' | 'admin' | 'user',
        created_at: user.created_at
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: selectedRole
      }); 

      if (error) throw error;

      // Refresh user list
      await fetchUsers();
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  const handleUpdateUser = async (userId: string, data: Partial<UserData>) => {
    try {
      const { error } = await supabase
        .from('user_management')
        .update(data)
        .eq('id', userId);

      if (error) throw error;

      // Refresh user list
      await fetchUsers();
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded hover:bg-opacity-80 text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-primary">
          User Management
        </h2>
      </div>

      {error && (
        <div className="p-4 mb-4 rounded text-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 p-4 mb-6 rounded-lg bg-surface">
        <Search size={20} style={{ color: currentTheme.colors.text.secondary }} />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-primary"
        />
      </div>

      <div className="rounded-lg overflow-hidden bg-surface">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-4 font-medium text-sm text-secondary">
                User
              </th>
              <th className="text-left p-4 font-medium text-sm text-secondary">
                Role
              </th>
              <th className="text-left p-4 font-medium text-sm text-secondary">
                Created
              </th>
              <th className="text-right p-4 font-medium text-sm text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr 
                key={user.id}
                className="border-theme border-solid"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
                    >
                      <User className="text-accent-primary" size={16} />
                    </div>
                    <div>
                      <div className="flex flex-col">
                        <span className="text-primary">
                          {editingUser === user.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={user.first_name}
                                onChange={(e) => handleUpdateUser(user.id, { first_name: e.target.value })}
                                placeholder="First name"
                                className="p-1 rounded text-sm text-primary border-theme border-solid bg-theme"                                
                              />
                              <input
                                type="text"
                                value={user.last_name}
                                onChange={(e) => handleUpdateUser(user.id, { last_name: e.target.value })}
                                placeholder="Last name"
                                className="p-1 rounded text-sm text-primary border-theme border-solid bg-theme"                                
                              />
                            </div>
                          ) : (
                            user.display_name || user.email
                          )}
                        </span>
                        <span className="text-sm text-secondary">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {editingUser === user.id ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="p-1 rounded text-sm text-primary border-theme border-solid bg-theme"                      
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="text-accent-primary" size={16} />
                      <span className="text-sm text-primary">
                        {user.admin_level === 'super_admin' ? 'Super Admin' : 
                         user.admin_level === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm text-secondary">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  {editingUser === user.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          handleUpdateRole(user.id);
                          handleUpdateUser(user.id, {
                            admin_level: selectedRole
                          });
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-accent-primary"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingUser(user.id);
                        setSelectedRole(user.admin_level);
                      }}
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;