import { RevokeTokenUseCase } from './revoke-token.use-case';

describe('RevokeTokenUseCase Unit Tests', () => {
  it('should remove the token from Redis', async () => {
    const redisClient = {
      del: jest.fn().mockResolvedValue(1),
    };

    const useCase = new RevokeTokenUseCase(redisClient as any);
    await useCase.execute('token-uuid-123');

    expect(redisClient.del).toHaveBeenCalledWith('token-uuid-123');
  });
});

