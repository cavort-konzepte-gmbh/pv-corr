export type Language = "en" | "de" | "es" | "fr" | "ar";

export interface TranslationMap {
  [key: string]: string | undefined;
}

export const LANGUAGES: { id: Language; name: string; direction: "ltr" | "rtl" }[] = [
  { id: "en", name: "English", direction: "ltr" },
  { id: "de", name: "Deutsch", direction: "ltr" },
  { id: "es", name: "Español", direction: "ltr" },
  { id: "fr", name: "Français", direction: "ltr" },
  { id: "ar", name: "العربية", direction: "rtl" },
];

// Initialize with default fallback translations for critical UI elements
let translations: TranslationMap = {
  // Add some basic fallback translations for critical UI elements
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
  "zones.location": "Location",
  "project.latitude": "Latitude",
  "project.longitude": "Longitude",
  "actions.save": "Save",
  "actions.cancel": "Cancel",
  "datapoints": "Datapoints",
  "fields": "Fields",
  "zones": "Zones",
};

export const setTranslations = (newTranslations: TranslationMap) => {
  if (newTranslations && Object.keys(newTranslations).length > 0) {
    // Merge with existing translations rather than replacing
    translations = { ...translations, ...newTranslations };
  }
};

export const useTranslation = (currentLanguage: Language) => {
  return (key: string): string => {
    // Return the translation if it exists, otherwise return the key
    if (!key) return '';
    return translations[key] !== undefined ? translations[key] as string : key;
  };
};
