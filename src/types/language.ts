export type Language = 'en' | 'de' | 'es' | 'fr' | 'ar';

export interface TranslationMap {
  [key: string]: string;
}

export const LANGUAGES: { id: Language; name: string; direction: 'ltr' | 'rtl' }[] = [
  { id: 'en', name: 'English', direction: 'ltr' },
  { id: 'de', name: 'Deutsch', direction: 'ltr' },
  { id: 'es', name: 'Español', direction: 'ltr' },
  { id: 'fr', name: 'Français', direction: 'ltr' },
  { id: 'ar', name: 'العربية', direction: 'rtl' }
];

let translations: TranslationMap = {};

export const setTranslations = (newTranslations: TranslationMap) => {
  translations = newTranslations;
};

export const useTranslation = (currentLanguage: Language) => {
  return (key: string): string => {
    return translations[key] || key;
  };
};