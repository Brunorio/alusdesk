import { ClsServiceManager } from 'nestjs-cls';

const TENANT_CONNECTION_CLS_KEY = 'tenantConnection';
const TENANT_ORGANIZATION_CLS_KEY = 'tenantOrganization';
const AUTH_USER_CLS_KEY = 'authUser';

export class TenantConnectionContext {
  static setConnection(connection: any): void {
    const cls = ClsServiceManager.getClsService();
    if (cls?.isActive()) {
      cls.set(TENANT_CONNECTION_CLS_KEY, connection);
    }
  }

  static getConnection<T = any>(): T | undefined {
    const cls = ClsServiceManager.getClsService();
    if (!cls?.isActive()) return undefined;
    return (cls.get as any)(TENANT_CONNECTION_CLS_KEY) as T | undefined;
  }

  static setOrganization(organization: any): void {
    const cls = ClsServiceManager.getClsService();
    if (cls?.isActive()) {
      cls.set(TENANT_ORGANIZATION_CLS_KEY, organization);
    }
  }

  static getOrganization<T = any>(): T | undefined {
    const cls = ClsServiceManager.getClsService();
    if (!cls?.isActive()) return undefined;
    return (cls.get as any)(TENANT_ORGANIZATION_CLS_KEY) as T | undefined;
  }

  static setUser(user: any): void {
    const cls = ClsServiceManager.getClsService();
    if (cls?.isActive()) {
      cls.set(AUTH_USER_CLS_KEY, user);
    }
  }

  static getUser<T = any>(): T | undefined {
    const cls = ClsServiceManager.getClsService();
    if (!cls?.isActive()) return undefined;
    return (cls.get as any)(AUTH_USER_CLS_KEY) as T | undefined;
  }
}
