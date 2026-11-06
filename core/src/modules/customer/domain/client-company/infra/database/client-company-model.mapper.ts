import { ClientCompany } from '../../domain/client-company';
import { ClientCompanyRow } from '../../../../../../database/schema/tenant.schema';

export class ClientCompanyModelMapper {
  static toEntity(row: ClientCompanyRow): ClientCompany {
    return new ClientCompany({
      id: row.id,
      organizationId: row.organizationId,
      corporateName: row.corporateName,
      tradeName: row.tradeName ?? undefined,
      documentNumber: row.documentNumber,
      maxConcurrentSessions: row.maxConcurrentSessions,
      isActive: row.isActive,
      licenseExpiresAt: row.licenseExpiresAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? undefined,
    });
  }

  static toModel(entity: ClientCompany): ClientCompanyRow {
    const output = entity.getOutput();
    return {
      id: output.id,
      organizationId: output.organizationId,
      corporateName: output.corporateName,
      tradeName: output.tradeName ?? '',
      documentNumber: output.documentNumber,
      maxConcurrentSessions: output.maxConcurrentSessions,
      isActive: output.isActive,
      licenseExpiresAt: output.licenseExpiresAt ?? null,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt ?? null,
    };
  }
}

