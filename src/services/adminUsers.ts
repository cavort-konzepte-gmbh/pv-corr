import { supabaseAdmin } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface CreateUserData {
  email: string;
  password: string;
  displayName?: string;
  adminLevel?: 'super_admin' | 'admin' | 'user';
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  adminLevel: 'super_admin' | 'admin' | 'user';
  createdAt: string;
  emailConfirmed: boolean;
}

const mapUserToAdminUser = (user: User): AdminUser => ({
  id: user.id,
  email: user.email || '',
  displayName: user.user_metadata?.display_name || user.email || '',
  adminLevel: user.user_metadata?.admin_level || 'user',
  createdAt: user.created_at || '',
  emailConfirmed: !!user.email_confirmed_at
});

export const createUser = async (userData: CreateUserData) => {
  if (!supabaseAdmin) {
    throw new Error('Admin client not configured');
  }

  const displayName = userData.displayName?.trim() || userData.email;

  // Create user directly through Auth API
  const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: {
      admin_level: userData.adminLevel || 'user',
      display_name: displayName
    }
  });

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return user ? mapUserToAdminUser(user) : null;
};

export const updateUser = async (userId: string, userData: {
  displayName?: string;
  adminLevel?: 'super_admin' | 'admin' | 'user';
}) => {
  if (!supabaseAdmin) {
    throw new Error('Admin client not configured');
  }

  // Get current user data first
  const { data: { user: currentUser }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (fetchError) throw fetchError;
  if (!currentUser) throw new Error('User not found');

  // Prevent modifying super admin roles
  if (currentUser.user_metadata?.admin_level === 'super_admin' && userData.adminLevel !== 'super_admin') {
    throw new Error('Cannot modify super admin privileges');
  }

  const displayName = userData.displayName?.trim() || currentUser.email;

  // Update user metadata through Auth API
  const { data: { user }, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        ...currentUser.user_metadata,
        admin_level: userData.adminLevel || currentUser.user_metadata?.admin_level || 'user',
        display_name: displayName
      }
    }
  );

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return user ? mapUserToAdminUser(user) : null;
};

export const deleteUser = async (userId: string) => {
  if (!supabaseAdmin) {
    throw new Error('Admin client not configured');
  }

  try {
    const { data: { user: currentUser }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      throw fetchError;
    }
    if (!currentUser) throw new Error('User not found');

    // Prevent deleting super admin users
    if (currentUser.user_metadata?.admin_level === 'super_admin') {
      throw new Error('Cannot delete super admin users');
    }

    // Delete user through Auth API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId,
      // Force delete even if user has data
      { shouldDeallocateId: true }
    );

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw deleteError;
    }

    return true;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('An unexpected error occurred while deleting the user');
  }
};

export const listUsers = async (): Promise<AdminUser[]> => {
  if (!supabaseAdmin) {
    throw new Error('Admin client not configured');
  }

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;

  return users.map(mapUserToAdminUser);
};