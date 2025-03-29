export interface DIN50929Parameter {
  id: string;
  code: string;
  name: {
    en: string;
    es: string;
    de: string;
  };
  unit: string;
  ranges: {
    min: number | string;
    max?: number | string;
    rating: number;
  }[];
  minMax: string;
}

export const DIN50929_PARAMETERS: DIN50929Parameter[] = [
  {
    id: 'z1',
    code: 'Z1',
    name: {
      en: 'Soil type/Proportion of components that can be sloughed off',
      es: 'Tipo de suelo/Porcentaje de componentes drenables',
      de: 'Bodenart/Anteil an abschlämmbaren Bestandteilen',
    },
    unit: '%',
    ranges: [
      { min: 0, max: 10, rating: 4 },
      { min: 10, max: 30, rating: 2 },
      { min: 30, max: 50, rating: 0 },
      { min: 50, max: 80, rating: -2 },
      { min: 80, rating: -4 },
      { min: 'impurities', rating: -12 },
    ],
    minMax: '0-100%',
  },
  {
    id: 'z2',
    code: 'Z2',
    name: {
      en: 'Specific soil resistivity',
      es: 'Resistividad específica del suelo',
      de: 'Spezifischer Bodenwiderstand',
    },
    unit: 'Ω⋅m',
    ranges: [
      { min: 500, rating: 4 },
      { min: 200, max: 500, rating: 2 },
      { min: 50, max: 200, rating: 0 },
      { min: 20, max: 50, rating: -2 },
      { min: 10, max: 20, rating: -4 },
      { min: 0, max: 10, rating: -6 },
    ],
    minMax: '0-10,000',
  },
  {
    id: 'z3',
    code: 'Z3',
    name: {
      en: 'Water content',
      es: 'Contenido de agua',
      de: 'Wassergehalt',
    },
    unit: '%',
    ranges: [
      { min: 0, max: 20, rating: 0 },
      { min: 20, max: 40, rating: -1 },
      { min: 40, rating: -2 },
    ],
    minMax: '0-100',
  },
  {
    id: 'z4',
    code: 'Z4',
    name: {
      en: 'pH value',
      es: 'Valor de pH',
      de: 'pH-Wert',
    },
    unit: '-',
    ranges: [
      { min: 0, max: 4, rating: -2 },
      { min: 4, max: 5, rating: -1 },
      { min: 5, max: 6, rating: 0 },
      { min: 6, max: 7, rating: 0 },
      { min: 7, max: 8, rating: 0 },
      { min: 8, max: 9, rating: -1 },
      { min: 9, rating: -2 },
    ],
    minMax: '0-14',
  },
  {
    id: 'z5',
    code: 'Z5',
    name: {
      en: 'Buffering capacity',
      es: 'Capacidad de amortiguación',
      de: 'Pufferkapazität',
    },
    unit: 'ml/kg',
    ranges: [
      { min: 0, max: 2, rating: 0 },
      { min: 2, max: 10, rating: -1 },
      { min: 10, max: 20, rating: -2 },
      { min: 20, rating: -3 },
    ],
    minMax: '0-100',
  },
  {
    id: 'z6',
    code: 'Z6',
    name: {
      en: 'Carbonate content',
      es: 'Contenido de carbonatos',
      de: 'Karbonatgehalt',
    },
    unit: '%',
    ranges: [
      { min: 0, max: 1, rating: -2 },
      { min: 1, max: 5, rating: -1 },
      { min: 5, max: 10, rating: 0 },
      { min: 10, rating: +1 },
    ],
    minMax: '0-100',
  },
  {
    id: 'z7',
    code: 'Z7',
    name: {
      en: 'Sulphate reducing bacteria/Sulphide content',
      es: 'Bacterias reductoras de azufre / Contenido de sulfuros',
      de: 'Sulfatreduzierende Bakterien/Sulfid-Gehalt',
    },
    unit: 'mg/kg',
    ranges: [
      { min: 0, max: 5, rating: 0 },
      { min: 5, max: 10, rating: -3 },
      { min: 10, rating: -6 },
    ],
    minMax: '0-50',
  },
  {
    id: 'z8',
    code: 'Z8',
    name: {
      en: 'Sulphate content',
      es: 'Contenido de Sulfatos',
      de: 'Sulfat-Gehalt',
    },
    unit: 'mmol/kg',
    ranges: [
      { min: 0, max: 2, rating: 0 },
      { min: 2, max: 5, rating: -1 },
      { min: 5, max: 10, rating: -2 },
      { min: 10, rating: -3 },
    ],
    minMax: '0-50',
  },
  {
    id: 'z9',
    code: 'Z9',
    name: {
      en: 'Neutral salts/Chlorides and sulphates in aqueous extract',
      es: 'Sales neutras/Cloruros y sulfatos en extracto acuoso',
      de: 'Neutralsalze/Chloride und Sulfate in wässrigen Auszug',
    },
    unit: 'mmol/kg',
    ranges: [
      { min: 0, max: 3, rating: 0 },
      { min: 3, max: 10, rating: -1 },
      { min: 10, max: 30, rating: -2 },
      { min: 30, max: 100, rating: -3 },
      { min: 100, rating: -4 },
    ],
    minMax: '0-500',
  },
  {
    id: 'z10',
    code: 'Z10',
    name: {
      en: 'Location of the object in relation to the groundwater',
      es: 'Presencia de agua bajo tierra',
      de: 'Lage des Objektes zum Grundwasser',
    },
    unit: '-',
    ranges: [
      { min: 'never', rating: 0 },
      { min: 'constant', rating: -1 },
      { min: 'intermittent', rating: -2 },
    ],
    minMax: 'n.a.',
  },
];
