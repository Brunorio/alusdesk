import { Queue } from '../../domain/queue';
import { DrizzleQueueRepository } from './queue.model';

describe('DrizzleQueueRepository Unit Tests', () => {
  let repository: DrizzleQueueRepository;
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
    repository = new DrizzleQueueRepository(mockDb);
  });

  it('should insert a queue', async () => {
    const queue = new Queue({
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      name: 'Billing Support',
      priority: 1,
    });

    await repository.insert(queue);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Billing Support',
        priority: 1,
      }),
    );
  });

  it('should find queues by organization id', async () => {
    const validId = '33333333-3333-4333-8333-333333333333';
    const row = {
      id: validId,
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      name: 'Billing Support',
      priority: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
    };
    mockDb.where.mockResolvedValueOnce([row]);

    const result = await repository.findByOrganizationId('80562e84-1886-455b-bb57-b0a1f26f7c9e');

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Queue);
  });
});

