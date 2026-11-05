import { CreateOrganizationUseCase } from './create-organization.use-case';
import { IOrganizationRepository } from '@core/modules/organization/domain/organization/domain/organization.repository';
import { Organization } from '@core/modules/organization/domain/organization/domain/organization';

describe('CreateOrganizationUseCase Integration Tests', () => {
  let useCase: CreateOrganizationUseCase;
  let organizationRepositoryMock: jest.Mocked<IOrganizationRepository>;

  beforeEach(() => {
    organizationRepositoryMock = {
      insert: jest.fn(),
      findByDocumentNumber: jest.fn(),
    } as unknown as jest.Mocked<IOrganizationRepository>;

    useCase = new CreateOrganizationUseCase(organizationRepositoryMock);
  });

  it('should successfully register a new subscriber organization', async () => {
    organizationRepositoryMock.findByDocumentNumber.mockResolvedValue(null);

    const input = {
      name: 'Alpha Helpdesk Services',
      documentNumber: '11.222.333/0001-44',
      maxConcurrentTickets: 30,
    };

    const output = await useCase.execute(input);

    expect(output.name).toBe('Alpha Helpdesk Services');
    expect(output.documentNumber).toBe('11.222.333/0001-44');
    expect(output.maxConcurrentTickets).toBe(30);
    expect(output.isActive).toBe(true);
    expect(organizationRepositoryMock.insert).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when an organization with the same tax document already exists', async () => {
    organizationRepositoryMock.findByDocumentNumber.mockResolvedValue(
      new Organization({
        name: 'Existing Org',
        documentNumber: '11.222.333/0001-44',
        maxConcurrentTickets: 10,
      }),
    );

    const input = {
      name: 'Alpha Helpdesk Services',
      documentNumber: '11.222.333/0001-44',
      maxConcurrentTickets: 30,
    };

    await expect(useCase.execute(input)).rejects.toThrow('error.organization_already_exists');
    expect(organizationRepositoryMock.insert).not.toHaveBeenCalled();
  });
});

