export type ParameterUnit = 
  'Ohm.m' |
  'Ohm.cm' |
  'mmol/kg' |
  'mg/kg' |
  'g/mol' |
  'mg/mmol' |
  '%' |
  'ppm' |
  'V' |
  'mV' |
  'A' |
  'mA';

export interface Parameter {
  id: string;
  hiddenId: string;
  name: string;
  description: string;
  customName?: string;
  shortName?: string;
  unit?: ParameterUnit;
  rangeType: 'range' | 'selection' | 'open' | 'greater' | 'less' | 'greaterEqual' | 'lessEqual';
  rangeValue: string;
  created_at?: string;
  updated_at?: string;
}