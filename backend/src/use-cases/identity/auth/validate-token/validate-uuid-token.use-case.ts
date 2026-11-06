import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUseCase } from '@core/use-cases/use-case.interface';
import Redis from 'ioredis';

export interface ValidatedTokenOutput {
  userId: string;
  organizationId: string;
  role: string;
}

@Injectable()
export class ValidateUuidTokenUseCase implements IUseCase<string, ValidatedTokenOutput> {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async execute(opaqueToken: string): Promise<ValidatedTokenOutput> {
    const jwtToken = await this.redisClient.get(opaqueToken);
    if (!jwtToken) {
      throw new UnauthorizedException('error.invalid_or_expired_token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(jwtToken);
      return {
        userId: payload.sub,
        organizationId: payload.organizationId,
        role: payload.role,
      };
    } catch {
      throw new UnauthorizedException('error.invalid_token');
    }
  }
}

