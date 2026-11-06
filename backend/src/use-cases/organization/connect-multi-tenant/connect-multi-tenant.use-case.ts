import { Inject, Injectable } from '@nestjs/common';
import { IUseCase } from '@core/use-cases/use-case.interface';
import { OrganizationId, OrganizationOutput } from '@core/modules/organization/domain/organization/domain/organization';
import { IOrganizationRepository } from '@core/modules/organization/domain/organization/domain/organization.repository';
import { IDatabaseConnection } from '../../../database/database.connection.interface';
import { TenantConnectionContext } from '../../../database/tenant-connection.context';

@Injectable()
export class ConnectMultiTenantUseCase implements IUseCase<string, OrganizationOutput> {
  constructor(
    @Inject('IOrganizationRepository')
    private readonly organizationRepository: IOrganizationRepository,
    @Inject('IDatabaseConnection')
    private readonly databaseConnection: IDatabaseConnection,
  ) {}

  async execute(organizationId: string): Promise<OrganizationOutput> {
    const organization = await this.organizationRepository.findById(new OrganizationId(organizationId));
    if (!organization) {
      throw new Error('error.organization_not_found');
    }

    const connection = organization.getConnection();
    if (!connection) {
      throw new Error('error.organization_connection_not_configured');
    }

    const tenantDb = await this.databaseConnection.connect(connection);
    TenantConnectionContext.setConnection(tenantDb);
    TenantConnectionContext.setOrganization(organization.getOutput());

    return organization.getOutput();
  }
}

