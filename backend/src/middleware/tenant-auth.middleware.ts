import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ValidateUuidTokenUseCase } from '../use-cases/identity/auth/validate-token/validate-uuid-token.use-case';
import { ConnectMultiTenantUseCase } from '../use-cases/organization/connect-multi-tenant/connect-multi-tenant.use-case';
import { TenantConnectionContext } from '../database/tenant-connection.context';

@Injectable()
export class TenantAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly validateUuidTokenUseCase: ValidateUuidTokenUseCase,
    private readonly connectMultiTenantUseCase: ConnectMultiTenantUseCase,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('error.authorization_header_missing');
    }

    const token = this.extractToken(authHeader);
    const tokenPayload = await this.validateUuidTokenUseCase.execute(token);

    await this.connectMultiTenantUseCase.execute(tokenPayload.organizationId);
    TenantConnectionContext.setUser(tokenPayload);

    next();
  }

  private extractToken(authorization: string): string {
    if (authorization.startsWith('Bearer ')) {
      return authorization.slice(7).trim();
    }
    return authorization.trim();
  }
}

