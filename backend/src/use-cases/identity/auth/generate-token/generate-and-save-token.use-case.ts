import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Uuid } from '@core/domain/value-object/uuid.vo';
import { IUseCase } from '@core/use-cases/use-case.interface';
import Redis from 'ioredis';

export interface GenerateTokenInput {
  userId: string;
  organizationId: string;
  role: string;
}

export interface AuthTokenOutput {
  token: string;
  expiresIn: number;
}

@Injectable()
export class GenerateAndSaveTokenUseCase implements IUseCase<GenerateTokenInput, AuthTokenOutput> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async execute(input: GenerateTokenInput): Promise<AuthTokenOutput> {
    const expiresInSeconds = Number(this.configService.get('JWT_EXPIRES_IN_SECONDS') ?? 86400);

    const payload = {
      sub: input.userId,
      organizationId: input.organizationId,
      role: input.role,
    };

    const jwtToken = await this.jwtService.signAsync(payload);
    const opaqueToken = new Uuid().id;

    await this.redisClient.set(opaqueToken, jwtToken, 'EX', expiresInSeconds);

    return {
      token: opaqueToken,
      expiresIn: expiresInSeconds,
    };
  }
}

