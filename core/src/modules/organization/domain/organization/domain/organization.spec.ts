import { Organization, OrganizationId } from './organization';

describe('Organization Domain Unit Tests', () => {
  const baseOrgInput = {
    name: 'TechCorp Solutions',
    documentNumber: '12.345.678/0001-90',
    maxConcurrentTickets: 20,
    isActive: true,
  };

  it('should create a valid Organization instance', () => {
    const org = new Organization(baseOrgInput);

    expect(org).toBeInstanceOf(Organization);
    expect(org.getId()).toBeInstanceOf(OrganizationId);

    const output = org.getOutput();
    expect(output.name).toBe('TechCorp Solutions');
    expect(output.documentNumber).toBe('12.345.678/0001-90');
    expect(output.maxConcurrentTickets).toBe(20);
    expect(output.isActive).toBe(true);
    expect(output.createdAt).toBeInstanceOf(Date);
  });

  it('should create an Organization with connection configuration', () => {
    const org = new Organization({
      ...baseOrgInput,
      connection: {
        host: 'postgres-tenant.internal',
        port: 5432,
        database: 'org_techcorp_db',
        username: 'techcorp_user',
        password: 'secure_password_123',
        schema: 'public',
        ssl: true,
      },
    });

    expect(org.getConnection()).toBeDefined();
    expect(org.getConnection()?.database).toBe('org_techcorp_db');
    expect(org.getOutput().connection?.host).toBe('postgres-tenant.internal');
  });

  it('should allow processing tickets when active and below max concurrent capacity', () => {
    const org = new Organization({
      ...baseOrgInput,
      maxConcurrentTickets: 10,
    });

    expect(org.canAcceptNewTicket(5)).toBe(true);
    expect(org.canAcceptNewTicket(9)).toBe(true);
  });

  it('should reject accepting tickets when total organization capacity is exhausted', () => {
    const org = new Organization({
      ...baseOrgInput,
      maxConcurrentTickets: 10,
    });

    expect(org.canAcceptNewTicket(10)).toBe(false);
    expect(org.canAcceptNewTicket(11)).toBe(false);
  });

  it('should reject accepting tickets when organization is inactive or suspended', () => {
    const inactiveOrg = new Organization({
      ...baseOrgInput,
      isActive: false,
    });

    expect(inactiveOrg.canAcceptNewTicket(0)).toBe(false);
  });

  it('should throw an error when name is empty', () => {
    expect(() => {
      new Organization({
        ...baseOrgInput,
        name: '',
      });
    }).toThrow('error.organization_name_required');
  });
});

