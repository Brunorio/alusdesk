import { Entity } from '../../../../../domain/entity';
import Input from '../../../../../domain/input';
import Output from '../../../../../domain/output';
import { OrganizationId } from './organization.id';
import { OrganizationRules } from './organization.rules';

export interface OrganizationInput extends Input {
  name: string;
  documentNumber: string;
  maxConcurrentTickets: number;
  isActive?: boolean;
}

export interface OrganizationOutput extends Output {
  name: string;
  documentNumber: string;
  maxConcurrentTickets: number;
  isActive: boolean;
}

export * from './organization.id';
export class Organization extends Entity {
  private readonly id: OrganizationId;
  private name: string;
  private documentNumber: string;
  private maxConcurrentTickets: number;
  private isActive: boolean;

  constructor(input: OrganizationInput) {
    super(input);
    this.id = input.id ? new OrganizationId(input.id) : new OrganizationId();
    this.name = input.name;
    this.documentNumber = input.documentNumber;
    this.maxConcurrentTickets = input.maxConcurrentTickets;
    this.isActive = input.isActive ?? true;

    this.validate(new OrganizationRules(this.getOutput()));
  }

  public canAcceptNewTicket(currentActiveTicketsCount: number): boolean {
    if (!this.isActive) {
      return false;
    }
    return currentActiveTicketsCount < this.maxConcurrentTickets;
  }

  public getId(): OrganizationId {
    return this.id;
  }

  public getOutput(): OrganizationOutput {
    return {
      id: this.id.id,
      name: this.name,
      documentNumber: this.documentNumber,
      maxConcurrentTickets: this.maxConcurrentTickets,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
