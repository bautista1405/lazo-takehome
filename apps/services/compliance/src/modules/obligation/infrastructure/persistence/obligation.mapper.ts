import type { ObligationStatusChange } from '@repo/types';
import { ObligationEntity } from '../../domain/obligation.entity';
import { ObligationStatusChangePersistence } from './obligation-status-change.persistence';
import { ObligationPersistence } from './obligation.persistence';

export class ObligationMapper {
  static toDomain(
    row: ObligationPersistence,
    statusHistory: ObligationStatusChangePersistence[] = [],
  ): ObligationEntity {
    return ObligationEntity.from(
      {
        id: row.id,
        version: row.version,
        type: row.type,
        title: row.title,
        description: row.description,
        status: row.status,
        dueDate: row.dueDate,
        owner: row.owner,
        requiresDocument: row.requiresDocument,
        documentUrl: row.documentUrl,
        companyTaxId: row.companyTaxId,
      },
      statusHistory.map((entry) => this.toStatusChange(entry)),
    );
  }

  static toPersistence(entity: ObligationEntity): ObligationPersistence {
    const obligation = entity.toDTO();
    const row = new ObligationPersistence();

    row.id = obligation.id;
    row.version = obligation.version;
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

  static toStatusChange(
    row: ObligationStatusChangePersistence,
  ): ObligationStatusChange {
    return {
      id: row.id,
      obligationId: row.obligationId,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      changedAt: row.changedAt.toISOString(),
    };
  }
}
