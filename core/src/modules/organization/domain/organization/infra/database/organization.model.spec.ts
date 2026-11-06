import { Organization } from '../../domain/organization';
import { DrizzleOrganizationRepository } from './organization.model';

describe('DrizzleOrganizationRepository Unit Tests', () => {
  let repository: DrizzleOrganizationRepository;
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
    repository = new DrizzleOrganizationRepository(mockDb);
  });

  it('should insert an organization', async () => {
    const org = new Organization({
      name: 'Test Org',
      documentNumber: '12345678901',
      maxConcurrentTickets: 10,
      connection: {
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        username: 'user',
        password: 'pass',
      },
    });

    await repository.insert(org);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Org',
        documentNumber: '12345678901',
        maxConcurrentTickets: 10,
      }),
    );
  });

  it('should find an organization by id', async () => {
    const row = {
      id: '4399e564-9693-41c1-8408-72e9c1db1b9c',
      name: 'TechCorp',
      documentNumber: '99887766000100',
      maxConcurrentTickets: 25,
      isActive: true,
      connection: null,
      createdAt: new Date(),
      updatedAt: null,
    };
    mockDb.limit.mockResolvedValueOnce([row]);

    const result = await repository.findById('4399e564-9693-41c1-8408-72e9c1db1b9c');

    expect(result).toBeInstanceOf(Organization);
    expect(result?.getId().id).toBe('4399e564-9693-41c1-8408-72e9c1db1b9c');
    expect(result?.getOutput().name).toBe('TechCorp');
  });

  it('should return null when organization is not found by id', async () => {
    mockDb.limit.mockResolvedValueOnce([]);

    const result = await repository.findById('4399e564-9693-41c1-8408-72e9c1db1b9c');

    expect(result).toBeNull();
  });

  it('should find an organization by document number', async () => {
    const row = {
      id: '4399e564-9693-41c1-8408-72e9c1db1b9c',
      name: 'TechCorp',
      documentNumber: '99887766000100',
      maxConcurrentTickets: 25,
      isActive: true,
      connection: null,
      createdAt: new Date(),
      updatedAt: null,
    };
    mockDb.limit.mockResolvedValueOnce([row]);

    const result = await repository.findByDocumentNumber('99887766000100');

    expect(result).toBeInstanceOf(Organization);
    expect(result?.getOutput().documentNumber).toBe('99887766000100');
  });

  it('should update an organization', async () => {
    const org = new Organization({
      name: 'Updated Org',
      documentNumber: '12345678901',
      maxConcurrentTickets: 15,
    });
    mockDb.where.mockResolvedValueOnce(undefined);

    await repository.update(org);

    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.set).toHaveBeenCalled();
  });

  it('should delete an organization', async () => {
    mockDb.where.mockResolvedValueOnce(undefined);

    await repository.delete('4399e564-9693-41c1-8408-72e9c1db1b9c');

    expect(mockDb.delete).toHaveBeenCalled();
  });
});

