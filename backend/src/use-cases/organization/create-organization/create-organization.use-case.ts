import { Injectable } from '@nestjs/common';
import { IUseCase } from '@core/use-cases/use-case.interface';
import { IOrganizationRepository } from '@core/modules/organization/domain/organization/domain/organization.repository';
import { Organization, OrganizationInput, OrganizationOutput } from '@core/modules/organization/domain/organization/domain/organization';
import { ConnectionInput } from '@core/domain/value-object/connection.vo';

export interface CreateOrganizationInput {
  name: string;
  documentNumber: string;
  maxConcurrentTickets: number;
  connection?: ConnectionInput;
}

@Injectable()
export class CreateOrganizationUseCase implements IUseCase<CreateOrganizationInput, OrganizationOutput> {
  constructor(private readonly organizationRepository: IOrganizationRepository) {}

  async execute(input: CreateOrganizationInput): Promise<OrganizationOutput> {
    const existing = await this.organizationRepository.findByDocumentNumber(input.documentNumber);
    if (existing) {
      throw new Error('error.organization_already_exists');
    }

    const organization = new Organization(input);
    await this.organizationRepository.insert(organization);

    return organization.getOutput();
  }
}

