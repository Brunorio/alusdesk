import { User, UserRole, UserStatus } from '../../domain/user';
import { DrizzleUserRepository } from './user.model';

describe('DrizzleUserRepository Unit Tests', () => {
  let repository: DrizzleUserRepository;
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
    repository = new DrizzleUserRepository(mockDb);
  });

  it('should insert a user', async () => {
    const user = new User({
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      name: 'Agent Cooper',
      email: 'cooper@fbi.gov',
      passwordHash: 'hash',
      role: UserRole.AGENT,
    });

    await repository.insert(user);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Agent Cooper',
        email: 'cooper@fbi.gov',
      }),
    );
  });

  it('should find user by email', async () => {
    const validId = '22222222-2222-4222-8222-222222222222';
    const row = {
      id: validId,
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      name: 'Agent Cooper',
      email: 'cooper@fbi.gov',
      passwordHash: 'hash',
      role: 'AGENT',
      status: 'OFFLINE',
      createdAt: new Date(),
      updatedAt: null,
    };
    mockDb.limit.mockResolvedValueOnce([row]);

    const result = await repository.findByEmail('cooper@fbi.gov');

    expect(result).toBeInstanceOf(User);
    expect(result?.getOutput().email).toBe('cooper@fbi.gov');
  });
});

