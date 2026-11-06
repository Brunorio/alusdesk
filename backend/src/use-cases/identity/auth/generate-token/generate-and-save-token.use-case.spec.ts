import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GenerateAndSaveTokenUseCase } from './generate-and-save-token.use-case';

describe('GenerateAndSaveTokenUseCase Unit Tests', () => {
  let useCase: GenerateAndSaveTokenUseCase;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;
  let redisClient: { set: jest.Mock };

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
    };
    configService = {
      get: jest.fn().mockReturnValue(3600),
    };
    redisClient = {
      set: jest.fn().mockResolvedValue('OK'),
    };

    useCase = new GenerateAndSaveTokenUseCase(
      jwtService as any,
      configService as any,
      redisClient as any,
    );
  });

  it('should generate JWT, store it in Redis under an opaque UUID key, and return the UUID', async () => {
    const input = {
      userId: '4399e564-9693-41c1-8408-72e9c1db1b9c',
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      role: 'ADMIN',
    };

    const result = await useCase.execute(input);

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: input.userId,
      organizationId: input.organizationId,
      role: input.role,
    });
    expect(redisClient.set).toHaveBeenCalledWith(
      result.token,
      'signed.jwt.token',
      'EX',
      3600,
    );
    expect(result.token).not.toBe('signed.jwt.token');
    expect(result.expiresIn).toBe(3600);
  });
});

