import { Organization } from '../../domain/organization';
import { OrganizationRow } from '../../../../../../database/schema/manager.schema';

export class OrganizationModelMapper {
  static toEntity(row: OrganizationRow): Organization {
    return new Organization({
      id: row.id,
      name: row.name,
      documentNumber: row.documentNumber,
      maxConcurrentTickets: row.maxConcurrentTickets,
      isActive: row.isActive,
      connection: row.connection ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? undefined,
    });
  }

  static toModel(entity: Organization): OrganizationRow {
    const output = entity.getOutput();
    return {
      id: output.id,
      name: output.name,
      documentNumber: output.documentNumber,
      maxConcurrentTickets: output.maxConcurrentTickets,
      isActive: output.isActive,
      connection: output.connection ?? null,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt ?? null,
    };
  }
}

