export type Obligation = {
    id: string;
    type: 'annual_report' | 'franchise_tax' | 'boi_report' | 'registered_agent_renewal';
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'submitted' | 'done';
    dueDate: string;
    owner: string;
    requiresDocument: boolean;
    companyTaxId: string;
}