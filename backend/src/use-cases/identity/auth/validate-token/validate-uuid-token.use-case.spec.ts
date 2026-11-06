import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ValidateUuidTokenUseCase } from './validate-uuid-token.use-case';

describe('ValidateUuidTokenUseCase Unit Tests', () => {
  let useCase: ValidateUuidTokenUseCase;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let redisClient: { get: jest.Mock };

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: '4399e564-9693-41c1-8408-72e9c1db1b9c',
        organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
        role: 'AGENT',
      }),
    };
    redisClient = {
      get: jest.fn().mockResolvedValue('valid.jwt.token'),
    };

    useCase = new ValidateUuidTokenUseCase(jwtService as any, redisClient as any);
  });

  it('should resolve token payload from Redis when opaque token exists', async () => {
    const result = await useCase.execute('uuid-token-123');

    expect(redisClient.get).toHaveBeenCalledWith('uuid-token-123');
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.jwt.token');
    expect(result).toEqual({
      userId: '4399e564-9693-41c1-8408-72e9c1db1b9c',
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      role: 'AGENT',
    });
  });

  it('should throw UnauthorizedException when opaque token is not found in Redis', async () => {
    redisClient.get.mockResolvedValue(null);

    await expect(useCase.execute('unknown-uuid')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when JWT verification fails', async () => {
    jwtService.verifyAsync?.mockRejectedValue(new Error('Invalid signature'));

    await expect(useCase.execute('corrupted-token')).rejects.toThrow(UnauthorizedException);
  });
});

