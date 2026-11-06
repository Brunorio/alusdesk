import { Rating } from '../../domain/rating';
import { DrizzleRatingRepository } from './rating.model';

describe('DrizzleRatingRepository Unit Tests', () => {
  let repository: DrizzleRatingRepository;
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
    repository = new DrizzleRatingRepository(mockDb);
  });

  it('should insert a rating', async () => {
    const rating = new Rating({
      ticketId: '44444444-4444-4444-8444-444444444444',
      customerId: '22222222-2222-4222-8222-222222222222',
      agentId: '55555555-5555-4555-8555-555555555555',
      score: 5,
      feedback: 'Great support!',
    });

    await repository.insert(rating);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 5,
        comment: 'Great support!',
      }),
    );
  });

  it('should find rating by ticket id', async () => {
    const validRatingId = '77777777-7777-4777-8777-777777777777';
    const row = {
      id: validRatingId,
      ticketId: '44444444-4444-4444-8444-444444444444',
      requesterId: '22222222-2222-4222-8222-222222222222',
      agentId: '55555555-5555-4555-8555-555555555555',
      score: 5,
      comment: 'Great support!',
      createdAt: new Date(),
    };
    mockDb.limit.mockResolvedValueOnce([row]);

    const result = await repository.findByTicketId('44444444-4444-4444-8444-444444444444');

    expect(result).toBeInstanceOf(Rating);
    expect(result?.getOutput().score).toBe(5);
  });
});

