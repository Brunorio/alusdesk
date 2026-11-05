import { CreateTicketUseCase } from './create-ticket.use-case';
import { ITicketRepository } from '@core/modules/helpdesk/domain/ticket/domain/ticket.repository';
import { IClientCompanyRepository } from '@core/modules/customer/domain/client-company/domain/client-company.repository';
import { IOrganizationRepository } from '@core/modules/organization/domain/organization/domain/organization.repository';
import { TicketStatus } from '@core/modules/helpdesk/domain/ticket/enums/ticket-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('CreateTicketUseCase Integration Tests', () => {
  let useCase: CreateTicketUseCase;
  let ticketRepositoryMock: jest.Mocked<ITicketRepository>;
  let companyRepositoryMock: jest.Mocked<IClientCompanyRepository>;
  let organizationRepositoryMock: jest.Mocked<IOrganizationRepository>;
  let eventEmitterMock: jest.Mocked<EventEmitter2>;

  beforeEach(() => {
    ticketRepositoryMock = {
      insert: jest.fn(),
      countActiveSessionsByCompany: jest.fn(),
      countActiveSessionsByOrganization: jest.fn(),
      generateProtocolNumber: jest.fn().mockResolvedValue('TCK-20261105-0001'),
    } as unknown as jest.Mocked<ITicketRepository>;

    companyRepositoryMock = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IClientCompanyRepository>;

    organizationRepositoryMock = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IOrganizationRepository>;

    eventEmitterMock = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    useCase = new CreateTicketUseCase(
      ticketRepositoryMock,
      companyRepositoryMock,
      organizationRepositoryMock,
      eventEmitterMock,
    );
  });

  it('should create a ticket in WAITING_QUEUE when organization and company have available capacity', async () => {
    organizationRepositoryMock.findById.mockResolvedValue({
      canAcceptNewTicket: jest.fn().mockReturnValue(true),
    } as any);
    ticketRepositoryMock.countActiveSessionsByOrganization.mockResolvedValue(10);

    companyRepositoryMock.findById.mockResolvedValue({
      canOpenSession: jest.fn().mockReturnValue(true),
    } as any);
    ticketRepositoryMock.countActiveSessionsByCompany.mockResolvedValue(2);

    const input = {
      organizationId: 'org-123',
      clientCompanyId: 'comp-456',
      requesterId: 'req-789',
      queueId: 'queue-n1',
    };

    const output = await useCase.execute(input);

    expect(output.protocolNumber).toBe('TCK-20261105-0001');
    expect(output.organizationId).toBe('org-123');
    expect(output.status).toBe(TicketStatus.WAITING_QUEUE);
    expect(ticketRepositoryMock.insert).toHaveBeenCalledTimes(1);
    expect(eventEmitterMock.emit).toHaveBeenCalledWith('ticket.created', expect.any(Object));
  });

  it('should throw an error when organization total capacity is exhausted', async () => {
    organizationRepositoryMock.findById.mockResolvedValue({
      canAcceptNewTicket: jest.fn().mockReturnValue(false),
    } as any);
    ticketRepositoryMock.countActiveSessionsByOrganization.mockResolvedValue(50);

    const input = {
      organizationId: 'org-123',
      clientCompanyId: 'comp-456',
      requesterId: 'req-789',
      queueId: 'queue-n1',
    };

    await expect(useCase.execute(input)).rejects.toThrow('error.organization_capacity_exceeded');
    expect(ticketRepositoryMock.insert).not.toHaveBeenCalled();
  });

  it('should throw an error when company concurrent sessions limit is exceeded', async () => {
    organizationRepositoryMock.findById.mockResolvedValue({
      canAcceptNewTicket: jest.fn().mockReturnValue(true),
    } as any);
    ticketRepositoryMock.countActiveSessionsByOrganization.mockResolvedValue(5);

    companyRepositoryMock.findById.mockResolvedValue({
      canOpenSession: jest.fn().mockReturnValue(false),
    } as any);
    ticketRepositoryMock.countActiveSessionsByCompany.mockResolvedValue(5);

    const input = {
      organizationId: 'org-123',
      clientCompanyId: 'comp-456',
      requesterId: 'req-789',
      queueId: 'queue-n1',
    };

    await expect(useCase.execute(input)).rejects.toThrow('error.concurrent_limit_exceeded');
    expect(ticketRepositoryMock.insert).not.toHaveBeenCalled();
  });
});
