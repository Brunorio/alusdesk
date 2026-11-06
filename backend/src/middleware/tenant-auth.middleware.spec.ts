import { UnauthorizedException } from '@nestjs/common';
import { TenantAuthMiddleware } from './tenant-auth.middleware';
import { TenantConnectionContext } from '../database/tenant-connection.context';

describe('TenantAuthMiddleware Unit Tests', () => {
  let middleware: TenantAuthMiddleware;
  let validateUuidTokenUseCase: { execute: jest.Mock };
  let connectMultiTenantUseCase: { execute: jest.Mock };

  beforeEach(() => {
    validateUuidTokenUseCase = {
      execute: jest.fn().mockResolvedValue({
        userId: 'usr-1',
        organizationId: 'org-1',
        role: 'AGENT',
      }),
    };
    connectMultiTenantUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'org-1', name: 'Org 1' }),
    };

    middleware = new TenantAuthMiddleware(
      validateUuidTokenUseCase as any,
      connectMultiTenantUseCase as any,
    );
  });

  it('should authenticate via UUID opaque token and connect tenant database', async () => {
    const req = {
      headers: {
        authorization: 'Bearer opaque-uuid-token-xyz',
      },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    const setUserSpy = jest.spyOn(TenantConnectionContext, 'setUser').mockImplementation();

    await middleware.use(req, res, next);

    expect(validateUuidTokenUseCase.execute).toHaveBeenCalledWith('opaque-uuid-token-xyz');
    expect(connectMultiTenantUseCase.execute).toHaveBeenCalledWith('org-1');
    expect(setUserSpy).toHaveBeenCalledWith({
      userId: 'usr-1',
      organizationId: 'org-1',
      role: 'AGENT',
    });
    expect(next).toHaveBeenCalled();

    setUserSpy.mockRestore();
  });

  it('should throw UnauthorizedException when authorization header is missing', async () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(UnauthorizedException);
    expect(next).not.toHaveBeenCalled();
  });
});

