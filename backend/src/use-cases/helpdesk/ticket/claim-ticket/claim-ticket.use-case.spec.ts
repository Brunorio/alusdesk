import { ClaimTicketUseCase } from './claim-ticket.use-case';
import { ITicketRepository } from '@core/modules/helpdesk/domain/ticket/domain/ticket.repository';
import { Ticket, TicketId } from '@core/modules/helpdesk/domain/ticket/domain/ticket';
import { TicketStatus } from '@core/modules/helpdesk/domain/ticket/enums/ticket-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ClaimTicketUseCase Integration Tests', () => {
  let useCase: ClaimTicketUseCase;
  let ticketRepositoryMock: jest.Mocked<ITicketRepository>;
  let eventEmitterMock: jest.Mocked<EventEmitter2>;

  beforeEach(() => {
    ticketRepositoryMock = {
      findById: jest.fn(),
      claimTicketAtomically: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    eventEmitterMock = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    useCase = new ClaimTicketUseCase(ticketRepositoryMock, eventEmitterMock);
  });

  it('should successfully claim a ticket waiting in queue', async () => {
    const validTicketId = 'c4f6a908-1111-4000-8000-000000000001';
    const existingTicket = new Ticket({
      id: validTicketId,
      organizationId: 'org-123',
      protocolNumber: 'TCK-20261105-0001',
      clientCompanyId: 'comp-123',
      requesterId: 'req-456',
      queueId: 'queue-n1',
      status: TicketStatus.WAITING_QUEUE,
    });

    const claimedTicket = new Ticket({
      id: validTicketId,
      organizationId: 'org-123',
      protocolNumber: 'TCK-20261105-0001',
      clientCompanyId: 'comp-123',
      requesterId: 'req-456',
      queueId: 'queue-n1',
      agentId: 'agent-789',
      status: TicketStatus.IN_PROGRESS,
      claimedAt: new Date(),
      queueWaitTimeSec: 25,
    });

    ticketRepositoryMock.claimTicketAtomically.mockResolvedValue(claimedTicket);

    const input = {
      ticketId: validTicketId,
      agentId: 'agent-789',
    };

    const output = await useCase.execute(input);

    expect(output.status).toBe(TicketStatus.IN_PROGRESS);
    expect(output.agentId).toBe('agent-789');
    expect(output.queueWaitTimeSec).toBe(25);
    expect(eventEmitterMock.emit).toHaveBeenCalledWith('ticket.claimed', output);
  });

  it('should throw an error when ticket has already been claimed by another agent', async () => {
    ticketRepositoryMock.claimTicketAtomically.mockRejectedValue(
      new Error('error.ticket_already_claimed_or_processed'),
    );

    const input = {
      ticketId: 'c4f6a908-1111-4000-8000-000000000001',
      agentId: 'agent-999',
    };

    await expect(useCase.execute(input)).rejects.toThrow('error.ticket_already_claimed_or_processed');
    expect(eventEmitterMock.emit).not.toHaveBeenCalled();
  });
});

