export type Obligation = {
  id: string;
  type: ObligationType;
  title: string;
  description: string;
  status: ObligationStatus;
  dueDate: string;
  owner: string;
  requiresDocument: boolean;
  documentUrl?: string | null;
  companyTaxId: string;
};

export type ObligationResponse = Omit<Obligation, 'companyTaxId'> & {
  maskedCompanyTaxId: string;
  overdue: boolean;
  allowedTransitions: ObligationStatus[];
};

export type ObligationStatus = 'pending' | 'in_progress' | 'submitted' | 'done';
export type ObligationType =
  | 'annual_report'
  | 'franchise_tax'
  | 'boi_report'
  | 'registered_agent_renewal';
