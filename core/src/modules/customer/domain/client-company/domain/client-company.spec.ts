import { ClientCompany, ClientCompanyId } from './client-company';

describe('ClientCompany Domain Unit Tests', () => {
  const baseCompanyInput = {
    organizationId: 'org-123',
    corporateName: 'Retail Market LTDA',
    tradeName: 'Retail Market',
    documentNumber: '98.765.432/0001-10',
    maxConcurrentSessions: 5,
    isActive: true,
  };

  it('should create a valid ClientCompany instance bound to an organization', () => {
    const company = new ClientCompany(baseCompanyInput);

    expect(company).toBeInstanceOf(ClientCompany);
    expect(company.getId()).toBeInstanceOf(ClientCompanyId);

    const output = company.getOutput();
    expect(output.organizationId).toBe('org-123');
    expect(output.corporateName).toBe('Retail Market LTDA');
    expect(output.maxConcurrentSessions).toBe(5);
    expect(output.isActive).toBe(true);
  });

  it('should allow opening a new session when within the licensed limit', () => {
    const company = new ClientCompany({
      ...baseCompanyInput,
      maxConcurrentSessions: 3,
    });

    expect(company.canOpenSession(0)).toBe(true);
    expect(company.canOpenSession(2)).toBe(true);
  });

  it('should reject opening a new session when concurrent limit is reached', () => {
    const company = new ClientCompany({
      ...baseCompanyInput,
      maxConcurrentSessions: 3,
    });

    expect(company.canOpenSession(3)).toBe(false);
    expect(company.canOpenSession(4)).toBe(false);
  });

  it('should reject opening a session if company is inactive or license expired', () => {
    const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const inactiveCompany = new ClientCompany({
      ...baseCompanyInput,
      isActive: false,
    });

    const expiredCompany = new ClientCompany({
      ...baseCompanyInput,
      licenseExpiresAt: expiredDate,
    });

    expect(inactiveCompany.canOpenSession(0)).toBe(false);
    expect(expiredCompany.canOpenSession(0)).toBe(false);
  });
});
