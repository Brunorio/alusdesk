import { Injectable } from '@nestjs/common';
import { IUseCase } from '@core/use-cases/use-case.interface';
import { ITicketRepository } from '@core/modules/helpdesk/domain/ticket/domain/ticket.repository';
import { IClientCompanyRepository } from '@core/modules/customer/domain/client-company/domain/client-company.repository';
import { IOrganizationRepository } from '@core/modules/organization/domain/organization/domain/organization.repository';
import { Ticket, TicketOutput } from '@core/modules/helpdesk/domain/ticket/domain/ticket';
import { TicketStatus } from '@core/modules/helpdesk/domain/ticket/enums/ticket-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CreateTicketInput {
  organizationId: string;
  clientCompanyId: string;
  requesterId: string;
  queueId: string;
}

@Injectable()
export class CreateTicketUseCase implements IUseCase<CreateTicketInput, TicketOutput> {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly clientCompanyRepository: IClientCompanyRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: CreateTicketInput): Promise<TicketOutput> {
    const organization = await this.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new Error('error.organization_not_found');
    }

    const orgActiveCount = await this.ticketRepository.countActiveSessionsByOrganization(input.organizationId);
    if (!organization.canAcceptNewTicket(orgActiveCount)) {
      throw new Error('error.organization_capacity_exceeded');
    }

    const clientCompany = await this.clientCompanyRepository.findById(input.clientCompanyId);
    if (!clientCompany) {
      throw new Error('error.client_company_not_found');
    }

    const companyActiveCount = await this.ticketRepository.countActiveSessionsByCompany(input.clientCompanyId);
    if (!clientCompany.canOpenSession(companyActiveCount)) {
      throw new Error('error.concurrent_limit_exceeded');
    }

    const protocolNumber = await this.ticketRepository.generateProtocolNumber(input.organizationId);

    const ticket = new Ticket({
      organizationId: input.organizationId,
      protocolNumber,
      clientCompanyId: input.clientCompanyId,
      requesterId: input.requesterId,
      queueId: input.queueId,
      status: TicketStatus.WAITING_QUEUE,
    });

    await this.ticketRepository.insert(ticket);
    const output = ticket.getOutput();

    this.eventEmitter.emit('ticket.created', output);

    return output;
  }
}
