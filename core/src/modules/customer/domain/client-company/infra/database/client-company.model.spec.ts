import { ClientCompany } from '../../domain/client-company';
import { DrizzleClientCompanyRepository } from './client-company.model';

describe('DrizzleClientCompanyRepository Unit Tests', () => {
  let repository: DrizzleClientCompanyRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn(),
      offset: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };
    repository = new DrizzleClientCompanyRepository(mockDb);
  });

  it('should insert a client company', async () => {
    const company = new ClientCompany({
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      corporateName: 'Alpha Logistics LTDA',
      tradeName: 'Alpha Cargo',
      documentNumber: '11.222.333/0001-44',
      maxConcurrentSessions: 8,
    });

    await repository.insert(company);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        corporateName: 'Alpha Logistics LTDA',
        tradeName: 'Alpha Cargo',
        documentNumber: '11.222.333/0001-44',
        maxConcurrentSessions: 8,
      }),
    );
  });

  it('should find a client company by id', async () => {
    const validId = '11111111-1111-4111-8111-111111111111';
    const row = {
      id: validId,
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      corporateName: 'Alpha Logistics LTDA',
      tradeName: 'Alpha Cargo',
      documentNumber: '11.222.333/0001-44',
      maxConcurrentSessions: 8,
      isActive: true,
      licenseExpiresAt: null,
      createdAt: new Date(),
      updatedAt: null,
    };
    mockDb.limit.mockResolvedValueOnce([row]);

    const result = await repository.findById(validId);

    expect(result).toBeInstanceOf(ClientCompany);
    expect(result?.getId().id).toBe(validId);
  });

  it('should find by document number scoped by organizationId', async () => {
    const validId = '11111111-1111-4111-8111-111111111111';
    const row = {
      id: validId,
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      corporateName: 'Alpha Logistics LTDA',
      tradeName: 'Alpha Cargo',
      documentNumber: '11.222.333/0001-44',
      maxConcurrentSessions: 8,
      isActive: true,
      licenseExpiresAt: null,
      createdAt: new Date(),
      updatedAt: null,
    };
    mockDb.limit.mockResolvedValueOnce([row]);

    const result = await repository.findByDocumentNumber(
      '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      '11.222.333/0001-44',
    );

    expect(result).toBeInstanceOf(ClientCompany);
  });
});
