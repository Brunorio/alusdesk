import { Inject, Injectable } from '@nestjs/common';
import { IUseCase } from '@core/use-cases/use-case.interface';
import Redis from 'ioredis';

@Injectable()
export class RevokeTokenUseCase implements IUseCase<string, void> {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async execute(opaqueToken: string): Promise<void> {
    await this.redisClient.del(opaqueToken);
  }
}

