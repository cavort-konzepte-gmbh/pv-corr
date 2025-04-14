import { supabase } from "../lib/supabase";
import { showToast } from "../lib/toast";

export interface UserMetadata {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  admin_level: "super_admin" | "admin" | "user";
  language?: string;
  decimal_separator?: "," | ".";
  show_hidden_ids?: boolean;
  theme_id?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  adminLevel: "super_admin" | "admin" | "user";
}

export const updateUserMetadata = async (metadata: Partial<UserMetadata>): Promise<boolean> => {
  try {
    // Get current user metadata first
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No user found");

    // Convert metadata keys to snake_case for storage
    const snakeCaseMetadata = {
      ...user.user_metadata,
      ...(metadata.firstName && { first_name: metadata.firstName }),
      ...(metadata.lastName && { last_name: metadata.lastName }),
      ...(metadata.displayName && { display_name: metadata.displayName }),
      ...(metadata.admin_level && { admin_level: metadata.admin_level }),
      ...(metadata.language && { language: metadata.language }),
      ...(metadata.decimal_separator && { decimal_separator: metadata.decimal_separator }),
      ...(metadata.show_hidden_ids !== undefined && { show_hidden_ids: metadata.show_hidden_ids }),
      ...(metadata.theme_id && { theme_id: metadata.theme_id }),
    };

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: snakeCaseMetadata,
    });

    if (error) {
      console.error("Error updating user metadata:", error.message);
      showToast(`Failed to update user settings: ${error.message}`, "error");
      return false;
    }

    if (!data.user) {
      showToast("No user returned after update", "error");
      throw new Error("No user returned after update");
    }

    // Dispatch event with updated settings
    window.dispatchEvent(
      new CustomEvent("userSettingsLoaded", {
        detail: data.user.user_metadata,
      }),
    );

    showToast("User settings updated successfully", "success");
    return true;
  } catch (error) {
    console.error("Error in updateUserMetadata:", error);
    showToast(`Failed to update user settings: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
    return false;
  }
};

export const getUsersByMetadata = async (key: keyof UserMetadata, value: any): Promise<UserProfile[]> => {
  try {
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    // Convert snake_case metadata to camelCase for consistency
    return users
      .filter((user) => user.user_metadata?.[key] === value)
      .map((user) => ({
        id: user.id,
        email: user.email || "",
        firstName: user.user_metadata?.firstName || user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.lastName || user.user_metadata?.last_name || "",
        displayName: user.user_metadata?.displayName || user.user_metadata?.display_name || user.email || "",
        adminLevel: user.user_metadata?.admin_level || "user",
      }));
  } catch (err) {
    console.error("Error in getUsersByMetadata:", err);
    return [];
  }
};

export const getAdminUsers = async (): Promise<UserProfile[]> => {
  const [admin, superAdmin] = await Promise.all([
    getUsersByMetadata("admin_level", "admin"),
    getUsersByMetadata("admin_level", "super_admin"),
  ]);
  return admin.concat(superAdmin);
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<boolean> => {
  try {
    // Get current user metadata
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(userId);
    if (userError) throw userError;
    if (!user) throw new Error("User not found");

    // Prepare new metadata
    const metadata: UserMetadata = {
      ...user.user_metadata,
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.displayName || `${profile.firstName} ${profile.lastName}`.trim(),
      admin_level: profile.adminLevel || user.user_metadata?.admin_level || "user",
    };

    // Update user
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...metadata,
        first_name: metadata.firstName,
        last_name: metadata.lastName,
        display_name: metadata.displayName,
      },
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error in updateUserProfile:", err);
    return false;
  }
};

export const isAdmin = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return false;

    const adminLevel = user.user_metadata?.admin_level;
    return adminLevel === "admin" || adminLevel === "super_admin";
  } catch (err) {
    console.error("Error checking admin status:", err);
    return false;
  }
};

export const isSuperAdmin = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return false;

    return user.user_metadata?.admin_level === "super_admin";
  } catch (err) {
    console.error("Error checking super admin status:", err);
    return false;
  }
};
