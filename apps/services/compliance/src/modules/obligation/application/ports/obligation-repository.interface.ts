import type { ObligationEntity } from "../../domain/obligation.entity";
import type { Obligation } from "@repo/types";

export interface IObligationRepository {
    findById(id: string): Promise<ObligationEntity | null>; 
    findByCompanyTaxId(companyTaxId: string): Promise<ObligationEntity | null>;
    save(obligation: ObligationEntity): Promise<ObligationEntity>; 
    delete(id: string): Promise<boolean>; 
    update(id: string, obligation: ObligationEntity): Promise<ObligationEntity | null>;
    updateStatus(id: string, status: Obligation['status']): Promise<ObligationEntity | null>;
}
