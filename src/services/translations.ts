import { supabase } from "../lib/supabase";
import { Language } from "../types/language";

// Cache for translations to avoid repeated API calls
let translationCache: Record<Language, Record<string, string>> = {} as Record<Language, Record<string, string>>;

export interface TranslationEntry {
  id: string;
  key: string;
  languageId: string;
  value: string;
}

export interface LanguageEntry {
  id: Language;
  name: string;
  direction: "ltr" | "rtl";
  isActive: boolean;
}

export const fetchTranslations = async (language: Language) => {
  try {
    // Check if we have in-memory cached translations for this language
    if (translationCache[language] && Object.keys(translationCache[language]).length > 0) {
      return translationCache[language];
    }

    // Try to get from localStorage as fallback
    try {
      const cachedTranslations = localStorage.getItem(`translations_${language}`);
      if (cachedTranslations) {
        const parsed = JSON.parse(cachedTranslations);
        if (Object.keys(parsed).length > 0) {
          translationCache[language] = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load translations from localStorage:", e);
    }

    const { data: translations, error } = await supabase
      .from("translations")
      .select("*")
      .eq("language_id", language)
      .order("key", { ascending: true });

    if (error) throw error;

    // Convert to key-value format
    const translationMap: Record<string, string> = {};
    translations.forEach((translation) => {
      if (translation.key && translation.value) {
        translationMap[translation.key] = translation.value;
      }
    });

    if (Object.keys(translationMap).length > 0) {
      // Cache translations in memory
      translationCache[language] = translationMap;

      // Also cache in localStorage as backup
      try {
        localStorage.setItem(`translations_${language}`, JSON.stringify(translationMap));
      } catch (e) {
        console.warn("Failed to cache translations in localStorage:", e);
      }
    }

    return translationMap;
  } catch (err) {
    console.error("Error fetching translations:", err);

    // Try to get from localStorage as fallback in case of API error
    try {
      const cachedTranslations = localStorage.getItem(`translations_${language}`);
      if (cachedTranslations) {
        return JSON.parse(cachedTranslations);
      }
    } catch (e) {
      console.warn("Failed to load fallback translations from localStorage:", e);
    }

    // Return basic fallback translations for critical UI elements
    return {
      "nav.customers": "Customers",
      "nav.projects": "Projects",
      "nav.fields": "Fields",
      "nav.zones": "Zones",
      "nav.datapoints": "Datapoints",
      "nav.analyse": "Analyse",
      "nav.output": "Output",
      "nav.settings": "Settings",
      "nav.administration": "Administration",
      "nav.signout": "Sign Out",
      "nav.back": "Back",
      "general.view_on_map": "View on map",
      "general.location_not_set": "Location not set",
      "field.has_fence.yes": "Yes",
      "field.has_fence.no": "No",
    };
  }
};

export const fetchAllTranslations = async () => {
  try {
    const { data: translations, error } = await supabase.from("translations").select("*").order("key", { ascending: true });

    if (error) throw error;

    // Convert to nested record format
    const translationMap: Record<string, Record<Language, string>> = {};
    translations.forEach((translation) => {
      if (!translationMap[translation.key]) {
        translationMap[translation.key] = {} as Record<Language, string>;
      }
      translationMap[translation.key][translation.language_id as Language] = translation.value;
    });

    return translationMap;
  } catch (err) {
    console.error("Error fetching all translations:", err);
    return {};
  }
};

export const fetchLanguages = async () => {
  try {
    const { data: languages, error } = await supabase.from("languages").select("*").order("name", { ascending: true });

    if (error) throw error;
    return languages as LanguageEntry[];
  } catch (err) {
    console.error("Error fetching languages:", err);
    return [];
  }
};

export const updateTranslation = async (key: string, languageId: string, value: string) => {
  try {
    // First check if the user has admin privileges
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user's admin level from their metadata
    const adminLevel = user.user_metadata?.admin_level;
    if (!adminLevel || !["admin", "super_admin"].includes(adminLevel)) {
      throw new Error("Insufficient permissions to update translations");
    }

    const { error } = await supabase.from("translations").upsert(
      {
        key,
        language_id: languageId,
        value,
      },
      {
        onConflict: "key,language_id",
      },
    );

    if (error) {
      if (error.code === "42501") {
        throw new Error("You don't have permission to update translations. Please contact your administrator.");
      }
      throw error;
    }

    // Clear the cache for this language to ensure fresh data on next fetch
    if (translationCache[languageId as Language]) {
      delete translationCache[languageId as Language];
    }
    localStorage.removeItem(`translations_${languageId}`);
  } catch (err) {
    console.error("Error updating translation:", err);
    throw err;
  }
};

export const deleteTranslation = async (key: string) => {
  try {
    // First check if the user has admin privileges
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user's admin level from their metadata
    const adminLevel = user.user_metadata?.admin_level;
    if (!adminLevel || !["admin", "super_admin"].includes(adminLevel)) {
      throw new Error("Insufficient permissions to delete translations");
    }

    const { error } = await supabase.from("translations").delete().eq("key", key);

    if (error) {
      if (error.code === "42501") {
        throw new Error("You don't have permission to delete translations. Please contact your administrator.");
      }
      throw error;
    }

    // Clear all language caches since we don't know which languages had this key
    translationCache = {} as Record<Language, Record<string, string>>;
    Object.keys(localStorage)
      .filter((key) => key.startsWith("translations_"))
      .forEach((key) => localStorage.removeItem(key));
  } catch (err) {
    console.error("Error deleting translation:", err);
    throw err;
  }
};

export const updateLanguage = async (id: string, data: Partial<LanguageEntry>) => {
  try {
    // First check if the user has admin privileges
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user's admin level from their metadata
    const adminLevel = user.user_metadata?.admin_level;
    if (!adminLevel || !["admin", "super_admin"].includes(adminLevel)) {
      throw new Error("Insufficient permissions to update languages");
    }

    const { error } = await supabase.from("languages").update(data).eq("id", id);

    if (error) {
      if (error.code === "42501") {
        throw new Error("You don't have permission to update languages. Please contact your administrator.");
      }
      throw error;
    }

    // Clear the cache for this language
    if (translationCache[id as Language]) {
      delete translationCache[id as Language];
    }
    localStorage.removeItem(`translations_${id}`);
  } catch (err) {
    console.error("Error updating language:", err);
    throw err;
  }
};
