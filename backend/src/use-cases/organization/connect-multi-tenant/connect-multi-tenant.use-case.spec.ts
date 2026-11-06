import { Organization } from '@core/modules/organization/domain/organization/domain/organization';
import { IOrganizationRepository } from '@core/modules/organization/domain/organization/domain/organization.repository';
import { IDatabaseConnection } from '../../../database/database.connection.interface';
import { TenantConnectionContext } from '../../../database/tenant-connection.context';
import { ConnectMultiTenantUseCase } from './connect-multi-tenant.use-case';

describe('ConnectMultiTenantUseCase Unit Tests', () => {
  let useCase: ConnectMultiTenantUseCase;
  let organizationRepository: jest.Mocked<Partial<IOrganizationRepository>>;
  let databaseConnection: jest.Mocked<IDatabaseConnection>;

  beforeEach(() => {
    organizationRepository = {
      findById: jest.fn(),
    };
    databaseConnection = {
      connect: jest.fn().mockResolvedValue({ dummyConnection: true }),
    };

    useCase = new ConnectMultiTenantUseCase(
      organizationRepository as any,
      databaseConnection,
    );
  });

  it('should establish tenant connection and store in context', async () => {
    const org = new Organization({
      name: 'Tenant Enterprise',
      documentNumber: '11.222.333/0001-44',
      maxConcurrentTickets: 15,
      connection: {
        host: 'postgres-t1',
        port: 5432,
        database: 'db_tenant_1',
        username: 'usr',
        password: 'pwd',
      },
    });

    organizationRepository.findById?.mockResolvedValue(org);
    const setConnectionSpy = jest.spyOn(TenantConnectionContext, 'setConnection').mockImplementation();
    const setOrgSpy = jest.spyOn(TenantConnectionContext, 'setOrganization').mockImplementation();

    const result = await useCase.execute(org.getId().id);

    expect(organizationRepository.findById).toHaveBeenCalled();
    expect(databaseConnection.connect).toHaveBeenCalledWith(org.getConnection());
    expect(setConnectionSpy).toHaveBeenCalledWith({ dummyConnection: true });
    expect(setOrgSpy).toHaveBeenCalledWith(org.getOutput());
    expect(result.id).toBe(org.getId().id);

    setConnectionSpy.mockRestore();
    setOrgSpy.mockRestore();
  });

  it('should throw error when organization does not exist', async () => {
    organizationRepository.findById?.mockResolvedValue(null);

    await expect(
      useCase.execute('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('error.organization_not_found');
  });

  it('should throw error when organization has no connection configured', async () => {
    const org = new Organization({
      name: 'Tenant Without DB',
      documentNumber: '11.222.333/0001-44',
      maxConcurrentTickets: 15,
    });

    organizationRepository.findById?.mockResolvedValue(org);

    await expect(useCase.execute(org.getId().id)).rejects.toThrow('error.organization_connection_not_configured');
  });
});
