import { supabase } from '../lib/supabase'
import { Language } from '../types/language'

export interface TranslationEntry {
  id: string
  key: string
  languageId: string
  value: string
}

export interface LanguageEntry {
  id: Language
  name: string
  direction: 'ltr' | 'rtl'
  isActive: boolean
}

export const fetchTranslations = async (language: Language) => {
  try {
    const { data: translations, error } = await supabase
      .from('translations')
      .select('*')
      .eq('language_id', language)
      .order('key', { ascending: true })

    if (error) throw error

    // Convert to key-value format
    const translationMap: Record<string, string> = {}
    translations.forEach((translation) => {
      translationMap[translation.key] = translation.value
    })

    return translationMap
  } catch (err) {
    console.error('Error fetching translations:', err)
    // Return empty object instead of throwing to prevent app crashes
    return {}
  }
}

export const fetchAllTranslations = async () => {
  try {
    const { data: translations, error } = await supabase.from('translations').select('*').order('key', { ascending: true })

    if (error) throw error

    // Convert to nested record format
    const translationMap: Record<string, Record<Language, string>> = {}
    translations.forEach((translation) => {
      if (!translationMap[translation.key]) {
        translationMap[translation.key] = {} as Record<Language, string>
      }
      translationMap[translation.key][translation.language_id as Language] = translation.value
    })

    return translationMap
  } catch (err) {
    console.error('Error fetching all translations:', err)
    return {}
  }
}

export const fetchLanguages = async () => {
  try {
    const { data: languages, error } = await supabase.from('languages').select('*').order('name', { ascending: true })

    if (error) throw error
    return languages as LanguageEntry[]
  } catch (err) {
    console.error('Error fetching languages:', err)
    return []
  }
}

export const updateTranslation = async (key: string, languageId: string, value: string) => {
  try {
    const { error } = await supabase.from('translations').upsert(
      {
        key,
        language_id: languageId,
        value,
      },
      {
        onConflict: 'key,language_id',
      },
    )

    if (error) throw error
  } catch (err) {
    console.error('Error updating translation:', err)
    throw err
  }
}

export const deleteTranslation = async (key: string) => {
  try {
    const { error } = await supabase.from('translations').delete().eq('key', key)

    if (error) throw error
  } catch (err) {
    console.error('Error deleting translation:', err)
    throw err
  }
}

export const updateLanguage = async (id: string, data: Partial<LanguageEntry>) => {
  try {
    const { error } = await supabase.from('languages').update(data).eq('id', id)

    if (error) throw error
  } catch (err) {
    console.error('Error updating language:', err)
    throw err
  }
}
