export const OBLIGATION_STATUSES = [
  'pending',
  'in_progress',
  'submitted',
  'done',
] as const;

export const OBLIGATION_TYPES = [
  'annual_report',
  'franchise_tax',
  'boi_report',
  'registered_agent_renewal',
] as const;

export type Obligation = {
  id: string;
  version: number;
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
  blockedTransitions: BlockedObligationTransition[];
  statusHistory: ObligationStatusChange[];
};

export type CreateObligationRequest = Omit<
  Obligation,
  'id' | 'version' | 'status'
>;

export type UpdateObligationRequest = Partial<CreateObligationRequest> & {
  expectedVersion: number;
};

export type UpdateObligationStatusRequest = {
  status: ObligationStatus;
  expectedVersion: number;
};

export type ObligationStatusChange = {
  id: string;
  obligationId: string;
  fromStatus: ObligationStatus;
  toStatus: ObligationStatus;
  changedAt: string;
};

export type BlockedObligationTransition = {
  status: ObligationStatus;
  reason: 'document_required';
};

export type ObligationStatus = (typeof OBLIGATION_STATUSES)[number];
export type ObligationType = (typeof OBLIGATION_TYPES)[number];
