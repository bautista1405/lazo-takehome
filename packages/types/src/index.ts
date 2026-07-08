export type Obligation = {
    id: string;
    type: ObligationType;
    title: string;
    description: string;
    status: ObligationStatus;
    dueDate: string;
    owner: string;
    requiresDocument: boolean;
    companyTaxId: string;
}

export type ObligationStatus = 'pending' | 'in_progress' | 'submitted' | 'done';
export type ObligationType = 'annual_report' | 'franchise_tax' | 'boi_report' | 'registered_agent_renewal';