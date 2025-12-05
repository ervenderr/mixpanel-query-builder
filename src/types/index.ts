export type FieldType = 'string' | 'number' | 'date';

export interface User {
  id: string;
  name: string;
  company: string;
  employees: number;
  created: Date;
  lastSeen: Date;
}

export interface Field {
  name: string;
  label: string;
  displayLabel?: string;
  category?: string;
  icon?: string;
  description?: string;
  type: FieldType;
  operators: Operator[];
}

export interface Operator {
  name: string;
  label: string;
}
