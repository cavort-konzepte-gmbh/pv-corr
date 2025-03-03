import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { Shield, User, Search, Edit2, Save, X, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { AdminUser, createUser, deleteUser, listUsers, updateUser } from '../../services/adminUsers';
import { supabaseAdmin } from '../../lib/supabase';

interface UserManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentTheme, onBack }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'admin' | 'user'>('user');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await listUsers();
      setUsers(users);
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
      setError(null);
      await updateUser(userId, {
        adminLevel: selectedRole
      });

      // Refresh user list and reset state
      await fetchUsers();
      setEditingUser(null);
      setError(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const handleUpdateUser = async (userId: string, data: { firstName?: string; lastName?: string }) => {
    try {
      // Get current user data
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
        user_metadata: {
          admin_level: selectedRole
        }
      }
      );

      if (error) throw error;
      await fetchUsers();
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setError(null);
      await deleteUser(userId);
      // Refresh user list
      await fetchUsers();
      setError(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleCreateUser = async () => {
    try {
      setError(null);
      if (!newUser.email || !newUser.password) {
        setError('Email and password are required');
        return;
      }

      await createUser({
        email: newUser.email,
        password: newUser.password,
        displayName: newUser.displayName
      });

      await fetchUsers();
      setShowNewUserForm(false);
      setNewUser({ email: '', password: '', displayName: '' });
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
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
        <div className="p-4 mb-4 rounded border text-accent-primary border-accent-primary bg-surface">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-accent-primary hover:text-accent-hover"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <button
        onClick={() => setShowNewUserForm(true)}
        className="px-4 py-2 mb-6 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
      >
        <Plus size={16} />
        Add New User
      </button>

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
        {loading && (
          <div className="text-center p-4 text-secondary">
            Loading...
          </div>
        )}
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
                          {user.displayName}
                        </span>
                        <span className="text-sm text-secondary">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="text-accent-primary" size={16} />
                    <span className="text-sm text-secondary">
                      {user.adminLevel === 'super_admin' ? 'Super Admin' : 
                       user.adminLevel === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-sm text-secondary">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                </td>
                <td className="p-4 text-right">
                  {editingUser === user.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdateRole(user.id)}
                        disabled={loading}
                        className="p-1 rounded hover:bg-opacity-80 text-accent-primary"
                        style={{ opacity: loading ? 0.5 : 1 }}
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        disabled={loading}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        style={{ opacity: loading ? 0.5 : 1 }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                   <div className="flex items-center justify-end gap-2">
                     <button
                       onClick={() => {
                         if (loading) return;
                         setEditingUser(user.id);
                         setSelectedRole(user.adminLevel);
                       }}
                       disabled={loading}
                       className="p-1 rounded hover:bg-opacity-80 text-secondary"
                       style={{ opacity: loading ? 0.5 : 1 }}
                     >
                       <Edit2 size={16} />
                     </button>
                     {user.adminLevel !== 'super_admin' && (
                       <button
                         onClick={() => {
                           if (loading) return;
                           handleDeleteUser(user.id);
                         }}
                         disabled={loading}
                         className="p-1 rounded hover:bg-opacity-80 text-secondary"
                         style={{ opacity: loading ? 0.5 : 1 }}
                       >
                         <Trash2 size={16} />
                       </button>
                     )}
                   </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-6 flex items-center gap-2 text-primary">
              <User className="text-accent-primary" size={20} />
              Add New User
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Email Address
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-theme"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-theme"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-theme"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowNewUserForm(false);
                    setNewUser({ email: '', password: '', displayName: '' });
                  }}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;