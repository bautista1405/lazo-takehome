import { ObligationEntity } from "../../domain/obligation.entity";

export interface IObligationRepository {
    findById(id: string): Promise<ObligationEntity | null>; 
    findByCompanyTaxId(id: string): Promise<ObligationEntity | null>;
    save(obligation: ObligationEntity): Promise<ObligationEntity>; 
    delete(id: string): Promise<string>; 
    update(id: string): Promise<ObligationEntity | null>;
    updateStatus(id: string): Promise<ObligationEntity | null>;
}