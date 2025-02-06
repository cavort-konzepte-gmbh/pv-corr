export type Language = 'en' | 'de' | 'es' | 'fr' | 'ar';

export interface Translation {
  [key: string]: {
    [key in Language]: string;
  };
}

export const LANGUAGES: { id: Language; name: string; direction: 'ltr' | 'rtl' }[] = [
  { id: 'en', name: 'English', direction: 'ltr' },
  { id: 'de', name: 'Deutsch', direction: 'ltr' },
  { id: 'es', name: 'Español', direction: 'ltr' },
  { id: 'fr', name: 'Français', direction: 'ltr' },
  { id: 'ar', name: 'العربية', direction: 'rtl' }
];

export const TRANSLATIONS: Translation = {
  // General
  'general.save': {
    en: 'Save',
    de: 'Speichern',
    es: 'Guardar',
    fr: 'Enregistrer',
    ar: 'حفظ'
  },
  'general.cancel': {
    en: 'Cancel',
    de: 'Abbrechen',
    es: 'Cancelar',
    fr: 'Annuler',
    ar: 'إلغاء'
  },
  'general.edit': {
    en: 'Edit',
    de: 'Bearbeiten',
    es: 'Editar',
    fr: 'Modifier',
    ar: 'تعديل'
  },
  'general.delete': {
    en: 'Delete',
    de: 'Löschen',
    es: 'Eliminar',
    fr: 'Supprimer',
    ar: 'حذف'
  },
  'general.add': {
    en: 'Add',
    de: 'Hinzufügen',
    es: 'Añadir',
    fr: 'Ajouter',
    ar: 'إضافة'
  },

  // Navigation
  'nav.projects': {
    en: 'Projects',
    de: 'Projekte',
    es: 'Proyectos',
    fr: 'Projets',
    ar: 'المشاريع'
  },
  'nav.settings': {
    en: 'Settings',
    de: 'Einstellungen',
    es: 'Ajustes',
    fr: 'Paramètres',
    ar: 'الإعدادات'
  },

  // Settings
  'settings.general': {
    en: 'General',
    de: 'Allgemein',
    es: 'General',
    fr: 'Général',
    ar: 'عام'
  },
  'settings.theme': {
    en: 'Theme',
    de: 'Design',
    es: 'Tema',
    fr: 'Thème',
    ar: 'المظهر'
  },
  'settings.companies': {
    en: 'Companies',
    de: 'Unternehmen',
    es: 'Empresas',
    fr: 'Entreprises',
    ar: 'الشركات'
  },
  'settings.sample_data.companies.description': {
    en: '5 sample companies with addresses and contacts',
    de: '5 Beispielunternehmen mit Adressen und Kontakten',
    es: '5 empresas de ejemplo con direcciones y contactos',
    fr: '5 entreprises d\'exemple avec adresses et contacts',
    ar: '5 شركات تجريبية مع عناوين وجهات اتصال'
  },
  'settings.sample_data.companies.requires_places': {
    en: '(requires Places)',
    de: '(benötigt Orte)',
    es: '(requiere Lugares)',
    fr: '(nécessite des Lieux)',
    ar: '(يتطلب الأماكن)'
  },
  'settings.datapoints': {
    en: 'Datapoints',
    de: 'Datenpunkte',
    es: 'Puntos de datos',
    fr: 'Points de données',
    ar: 'نقاط البيانات'
  },
  'settings.language': {
    en: 'Language',
    de: 'Sprache',
    es: 'Idioma',
    fr: 'Langue',
    ar: 'اللغة'
  },
  'settings.decimal_separator': {
    en: 'Decimal Separator',
    de: 'Dezimaltrennzeichen',
    es: 'Separador decimal',
    fr: 'Séparateur décimal',
    ar: 'فاصل عشري'
  },
  'settings.decimal_separator.description': {
    en: 'Choose the decimal separator for numbers',
    de: 'Wählen Sie das Dezimaltrennzeichen für Zahlen',
    es: 'Elija el separador decimal para números',
    fr: 'Choisissez le séparateur décimal pour les nombres',
    ar: 'اختر الفاصل العشري للأرقام'
  },
  'settings.decimal_separator.comma': {
    en: 'Comma (,)',
    de: 'Komma (,)',
    es: 'Coma (,)',
    fr: 'Virgule (,)',
    ar: 'فاصلة (,)'
  },
  'settings.decimal_separator.point': {
    en: 'Point (.)',
    de: 'Punkt (.)',
    es: 'Punto (.)',
    fr: 'Point (.)',
    ar: 'نقطة (.)'
  },
  'settings.autosave': {
    en: 'Auto-save changes',
    de: 'Änderungen automatisch speichern',
    es: 'Guardar cambios automáticamente',
    fr: 'Enregistrement automatique',
    ar: 'حفظ التغييرات تلقائياً'
  },
  'settings.autosave.enabled': {
    en: 'Enabled',
    de: 'Aktiviert',
    es: 'Activado',
    fr: 'Activé',
    ar: 'مفعل'
  },
  'settings.hidden_ids': {
    en: 'Show Hidden IDs',
    de: 'Versteckte IDs anzeigen',
    es: 'Mostrar IDs ocultos',
    fr: 'Afficher les IDs cachés',
    ar: 'إظهار المعرفات المخفية'
  },
  'settings.hidden_ids.description': {
    en: 'Display 24-digit hex IDs for all items',
    de: '24-stellige Hex-IDs für alle Elemente anzeigen',
    es: 'Mostrar IDs hexadecimales de 24 dígitos para todos los elementos',
    fr: 'Afficher les IDs hexadécimaux de 24 chiffres pour tous les éléments',
    ar: 'عرض معرفات سداسية عشرية مكونة من 24 رقماً لجميع العناصر'
  },
  'settings.language.description': {
    en: 'Choose your preferred language',
    de: 'Wählen Sie Ihre bevorzugte Sprache',
    es: 'Elija su idioma preferido',
    fr: 'Choisissez votre langue préférée',
    ar: 'اختر لغتك المفضلة'
  },
  'settings.sample_data': {
    en: 'Sample Data',
    de: 'Beispieldaten',
    es: 'Datos de ejemplo',
    fr: 'Données d\'exemple',
    ar: 'بيانات تجريبية'
  },
  'settings.sample_data.description': {
    en: 'Enable/disable all sample data',
    de: 'Alle Beispieldaten aktivieren/deaktivieren',
    es: 'Activar/desactivar todos los datos de ejemplo',
    fr: 'Activer/désactiver toutes les données d\'exemple',
    ar: 'تفعيل/تعطيل جميع البيانات التجريبية'
  },
  'settings.sample_data.places': {
    en: 'Places',
    de: 'Orte',
    es: 'Lugares',
    fr: 'Lieux',
    ar: 'الأماكن'
  },
  'settings.sample_data.places.description': {
    en: '10 sample addresses across different countries',
    de: '10 Beispieladressen aus verschiedenen Ländern',
    es: '10 direcciones de ejemplo de diferentes países',
    fr: '10 adresses d\'exemple de différents pays',
    ar: '10 عناوين تجريبية من مختلف البلدان'
  },
  'settings.sample_data.people': {
    en: 'People',
    de: 'Personen',
    es: 'Personas',
    fr: 'Personnes',
    ar: 'الأشخاص'
  },
  'settings.sample_data.people.description': {
    en: '10 sample contacts with addresses',
    de: '10 Beispielkontakte mit Adressen',
    es: '10 contactos de ejemplo con direcciones',
    fr: '10 contacts d\'exemple avec adresses',
    ar: '10 جهات اتصال تجريبية مع عناوين'
  },
  'settings.sample_data.people.requires_places': {
    en: '(requires Places)',
    de: '(benötigt Orte)',
    es: '(requiere Lugares)',
    fr: '(nécessite des Lieux)',
    ar: '(يتطلب الأماكن)'
  },
  'settings.sample_data.projects': {
    en: 'Projects',
    de: 'Projekte',
    es: 'Proyectos',
    fr: 'Projets',
    ar: 'المشاريع'
  },
  'settings.sample_data.projects.description': {
    en: '2 projects with multiple fields, zones, and 40+ datapoints',
    de: '2 Projekte mit mehreren Feldern, Zonen und über 40 Datenpunkten',
    es: '2 proyectos con múltiples campos, zonas y más de 40 puntos de datos',
    fr: '2 projets avec plusieurs champs, zones et plus de 40 points de données',
    ar: 'مشروعان مع حقول ومناطق متعددة وأكثر من 40 نقطة بيانات'
  },
  'settings.enabled': {
    en: 'Enabled',
    de: 'Aktiviert',
    es: 'Activado',
    fr: 'Activé',
    ar: 'مفعل'
  },
  'settings.not_enabled': {
    en: 'Not enabled',
    de: 'Nicht aktiviert',
    es: 'No activado',
    fr: 'Non activé',
    ar: 'غير مفعل'
  },
  'standards.all': {
    en: 'All Standards',
    de: 'Alle Standards',
    es: 'Todos los Estándares',
    fr: 'Tous les Standards',
    ar: 'جميع المعايير'
  },
  'standards.select': {
    en: 'Select Standard',
    de: 'Standard auswählen',
    es: 'Seleccionar Estándar',
    fr: 'Sélectionner Standard',
    ar: 'اختر المعيار'
  },
  'actions.cancel': {
    en: 'Cancel',
    de: 'Abbrechen',
    es: 'Cancelar',
    fr: 'Annuler',
    ar: 'إلغاء'
  },
  'actions.save': {
    en: 'Save',
    de: 'Speichern',
    es: 'Guardar',
    fr: 'Enregistrer',
    ar: 'حفظ'
  },
  'actions.edit': {
    en: 'Edit',
    de: 'Bearbeiten',
    es: 'Editar',
    fr: 'Modifier',
    ar: 'تعديل'
  },
  'actions.history': {
    en: 'History',
    de: 'Verlauf',
    es: 'Historial',
    fr: 'Historique',
    ar: 'السجل'
  },
  'actions.close': {
    en: 'Close',
    de: 'Schließen',
    es: 'Cerrar',
    fr: 'Fermer',
    ar: 'إغلاق'
  },
  'datapoint.history': {
    en: 'Change History',
    de: 'Änderungsverlauf',
    es: 'Historial de cambios',
    fr: 'Historique des modifications',
    ar: 'سجل التغييرات'
  },
  'datapoint.no_history': {
    en: 'No changes recorded',
    de: 'Keine Änderungen aufgezeichnet',
    es: 'No hay cambios registrados',
    fr: 'Aucun changement enregistré',
    ar: 'لم يتم تسجيل أي تغييرات'
  },
  'actions.select_value': {
    en: 'Select value',
    de: 'Wert auswählen',
    es: 'Seleccionar valor',
    fr: 'Sélectionner une valeur',
    ar: 'اختر قيمة'
  },
  'project.new': {
    en: 'New Project',
    de: 'Neues Projekt',
    es: 'Nuevo Proyecto',
    fr: 'Nouveau Projet',
    ar: 'مشروع جديد'
  },
  'project.name': {
    en: 'Project Name',
    de: 'Projektname',
    es: 'Nombre del Proyecto',
    fr: 'Nom du Projet',
    ar: 'اسم المشروع'
  },
  'project.fields': {
    en: 'Fields',
    de: 'Felder',
    es: 'Campos',
    fr: 'Champs',
    ar: 'الحقول'
  },
  'project.zones': {
    en: 'Zones',
    de: 'Zonen',
    es: 'Zonas',
    fr: 'Zones',
    ar: 'المناطق'
  },
  'project.datapoints': {
    en: 'Datapoints',
    de: 'Datenpunkte',
    es: 'Puntos de datos',
    fr: 'Points de données',
    ar: 'نقاط البيانات'
  },
  'field.new': {
    en: 'New Field',
    de: 'Neues Feld',
    es: 'Nuevo Campo',
    fr: 'Nouveau Champ',
    ar: 'حقل جديد'
  },
  'field.name': {
    en: 'Field Name',
    de: 'Feldname',
    es: 'Nombre del Campo',
    fr: 'Nom du Champ',
    ar: 'اسم الحقل'
  },
  'zone.new': {
    en: 'New Zone',
    de: 'Neue Zone',
    es: 'Nueva Zona',
    fr: 'Nouvelle Zone',
    ar: 'منطقة جديدة'
  },
  'zone.name': {
    en: 'Zone Name',
    de: 'Zonenname',
    es: 'Nombre de la Zona',
    fr: 'Nom de la Zone',
    ar: 'اسم المنطقة'
  },
  'zone.total_rating': {
    en: 'Total Rating',
    de: 'Gesamtbewertung',
    es: 'Calificación Total',
    fr: 'Note Totale',
    ar: 'التقييم الإجمالي'
  },
  'zone.not_found': {
    en: 'Zone data not available',
    de: 'Zonendaten nicht verfügbar',
    es: 'Datos de zona no disponibles',
    fr: 'Données de zone non disponibles',
    ar: 'بيانات المنطقة غير متوفرة'
  },
  'datapoint.new': {
    en: 'New Datapoint',
    de: 'Neuer Datenpunkt',
    es: 'Nuevo Punto de Datos',
    fr: 'Nouveau Point de Données',
    ar: 'نقطة بيانات جديدة'
  },
  'datapoint.name': {
    en: 'Datapoint Name',
    de: 'Datenpunktname',
    es: 'Nombre del Punto de Datos',
    fr: 'Nom du Point de Données',
    ar: 'اسم نقطة البيانات'
  },
  'datapoint.value': {
    en: 'Value',
    de: 'Wert',
    es: 'Valor',
    fr: 'Valeur',
    ar: 'القيمة'
  },
  'datapoint.timestamp': {
    en: 'Timestamp',
    de: 'Zeitstempel',
    es: 'Marca de tiempo',
    fr: 'Horodatage',
    ar: 'الطابع الزمني'
  },
  'table.id': {
    en: 'ID',
    de: 'ID',
    es: 'ID',
    fr: 'ID',
    ar: 'المعرف'
  },
  'table.name': {
    en: 'Name',
    de: 'Name',
    es: 'Nombre',
    fr: 'Nom',
    ar: 'الاسم'
  },
  'table.timestamp': {
    en: 'Timestamp',
    de: 'Zeitstempel',
    es: 'Marca de tiempo',
    fr: 'Horodatage',
    ar: 'الطابع الزمني'
  },
  'table.actions': {
    en: 'Actions',
    de: 'Aktionen',
    es: 'Acciones',
    fr: 'Actions',
    ar: 'الإجراءات'
  },
  'form.range': {
    en: 'Range',
    de: 'Bereich',
    es: 'Rango',
    fr: 'Plage',
    ar: 'النطاق'
  },
  'form.value_in': {
    en: 'Value in',
    de: 'Wert in',
    es: 'Valor en',
    fr: 'Valeur en',
    ar: 'القيمة في'
  }
};

export const useTranslation = (currentLanguage: Language) => {
  return (key: string) => {
    return TRANSLATIONS[key]?.[currentLanguage] || TRANSLATIONS[key]?.['en'] || key;
  };
};