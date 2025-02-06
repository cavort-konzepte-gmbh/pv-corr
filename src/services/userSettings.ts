import { supabase } from '../lib/supabase';
import { Language } from '../types/language';
import { ThemeId } from '../types/theme';

export interface UserSettings {
  language: Language;
  decimalSeparator: ',' | '.';
  showHiddenIds: boolean;
  theme_id: ThemeId;
}

export const fetchUserSettings = async (): Promise<UserSettings | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('language, decimal_separator, show_hidden_ids, theme_id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching user settings:', error);
      return null;
    }

    // If no settings exist yet, create default settings
    if (!data) {
      const defaultSettings: UserSettings = {
        language: 'en',
        decimalSeparator: ',',
        showHiddenIds: false,
        theme_id: 'ferra'
      };

      const { error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: session.user.id,
          language: defaultSettings.language,
          decimal_separator: defaultSettings.decimalSeparator,
          show_hidden_ids: defaultSettings.showHiddenIds,
          theme_id: defaultSettings.theme_id
        });

      if (insertError) {
        console.error('Error creating default settings:', insertError);
        return null;
      }

      return defaultSettings;
    }

    return {
      language: data.language as Language,
      decimalSeparator: data.decimal_separator as ',' | '.',
      showHiddenIds: data.show_hidden_ids,
      theme_id: data.theme_id || 'ferra' as ThemeId
    };
  } catch (err) {
    console.error('Error in fetchUserSettings:', err);
    return null;
  }
};

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  
  try {
    // First check if settings exist for this user
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    const updateData = {
      ...(settings.language && { language: settings.language }),
      ...(settings.decimalSeparator && { decimal_separator: settings.decimalSeparator }),
      ...(settings.showHiddenIds !== undefined && { show_hidden_ids: settings.showHiddenIds }),
      ...(settings.theme_id && { theme_id: settings.theme_id })
    };

    if (!existingSettings) {
      // If no settings exist, create new settings
      const { error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: session.user.id,
          ...updateData
        });

      if (insertError) {
        console.error('Error creating user settings:', insertError);
        return false;
      }
    } else {
      // If settings exist, update them
      const { error: updateError } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', session.user.id);

      if (updateError) {
        console.error('Error updating user settings:', updateError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserSettings:', error);
    return false;
  }
};