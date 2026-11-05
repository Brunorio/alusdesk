import { Entity } from '../../../../../domain/entity';
import Input from '../../../../../domain/input';
import Output from '../../../../../domain/output';
import { ClientCompanyId } from './client-company.id';
import { ClientCompanyRules } from './client-company.rules';

export interface ClientCompanyInput extends Input {
  organizationId: string;
  corporateName: string;
  tradeName?: string;
  documentNumber: string;
  maxConcurrentSessions: number;
  isActive?: boolean;
  licenseExpiresAt?: Date;
}

export interface ClientCompanyOutput extends Output {
  organizationId: string;
  corporateName: string;
  tradeName?: string;
  documentNumber: string;
  maxConcurrentSessions: number;
  isActive: boolean;
  licenseExpiresAt?: Date;
}

export * from './client-company.id';
export class ClientCompany extends Entity {
  private readonly id: ClientCompanyId;
  private readonly organizationId: string;
  private corporateName: string;
  private tradeName?: string;
  private documentNumber: string;
  private maxConcurrentSessions: number;
  private isActive: boolean;
  private licenseExpiresAt?: Date;

  constructor(input: ClientCompanyInput) {
    super(input);
    this.id = input.id ? new ClientCompanyId(input.id) : new ClientCompanyId();
    this.organizationId = input.organizationId;
    this.corporateName = input.corporateName;
    this.tradeName = input.tradeName;
    this.documentNumber = input.documentNumber;
    this.maxConcurrentSessions = input.maxConcurrentSessions;
    this.isActive = input.isActive ?? true;
    this.licenseExpiresAt = input.licenseExpiresAt;

    this.validate(new ClientCompanyRules(this.getOutput()));
  }

  public canOpenSession(currentActiveSessionsCount: number): boolean {
    if (!this.isActive) {
      return false;
    }
    if (this.licenseExpiresAt && this.licenseExpiresAt.getTime() < Date.now()) {
      return false;
    }
    return currentActiveSessionsCount < this.maxConcurrentSessions;
  }

  public getId(): ClientCompanyId {
    return this.id;
  }

  public getOutput(): ClientCompanyOutput {
    return {
      id: this.id.id,
      organizationId: this.organizationId,
      corporateName: this.corporateName,
      tradeName: this.tradeName,
      documentNumber: this.documentNumber,
      maxConcurrentSessions: this.maxConcurrentSessions,
      isActive: this.isActive,
      licenseExpiresAt: this.licenseExpiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
