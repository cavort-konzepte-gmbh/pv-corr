import { Language, TRANSLATIONS } from '../types/language';

export const t = (key: string, language: Language = 'en'): string => {
  return TRANSLATIONS[key]?.[language] || TRANSLATIONS[key]?.['en'] || key;
};