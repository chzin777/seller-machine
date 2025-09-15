export interface RFVRule {
  score: number;
  label: string;
  min?: number;
  max?: number;
}

export interface RFVParameterSet {
  id?: number;
  name: string;
  filialId?: number | null;
  calculation_strategy: 'automatic' | 'manual';
  effectiveFrom: string;
  effectiveTo?: string;
  ruleRecency: RFVRule[];
  ruleFrequency: RFVRule[];
  ruleValue: RFVRule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FilialOption {
  id: number;
  nome: string;
  cidade?: string;
  estado?: string;
}
