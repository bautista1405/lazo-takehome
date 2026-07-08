import { ObligationEntity } from '../../domain/obligation.entity';
import { ObligationPersistence } from './obligation.persistence';

export class ObligationMapper {
  static toDomain(row: ObligationPersistence): ObligationEntity {
    return ObligationEntity.from({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      status: row.status,
      dueDate: row.dueDate,
      owner: row.owner,
      requiresDocument: row.requiresDocument,
      documentUrl: row.documentUrl,
      companyTaxId: row.companyTaxId,
    });
  }

  static toPersistence(entity: ObligationEntity): ObligationPersistence {
    const obligation = entity.toDTO();
    const row = new ObligationPersistence();

    row.id = obligation.id;
    row.type = obligation.type;
    row.title = obligation.title;
    row.description = obligation.description;
    row.status = obligation.status;
    row.dueDate = obligation.dueDate;
    row.owner = obligation.owner;
    row.requiresDocument = obligation.requiresDocument;
    row.documentUrl = obligation.documentUrl ?? null;
    row.companyTaxId = obligation.companyTaxId;

    return row;
  }
}
