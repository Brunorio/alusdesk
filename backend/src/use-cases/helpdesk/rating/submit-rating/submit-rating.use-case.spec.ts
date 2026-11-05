import { SubmitRatingUseCase } from './submit-rating.use-case';
import { IRatingRepository } from '@core/modules/helpdesk/domain/rating/domain/rating.repository';
import { ITicketRepository } from '@core/modules/helpdesk/domain/ticket/domain/ticket.repository';
import { Ticket } from '@core/modules/helpdesk/domain/ticket/domain/ticket';
import { TicketStatus } from '@core/modules/helpdesk/domain/ticket/enums/ticket-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('SubmitRatingUseCase Integration Tests', () => {
  let useCase: SubmitRatingUseCase;
  let ratingRepositoryMock: jest.Mocked<IRatingRepository>;
  let ticketRepositoryMock: jest.Mocked<ITicketRepository>;
  let eventEmitterMock: jest.Mocked<EventEmitter2>;

  beforeEach(() => {
    ratingRepositoryMock = {
      insert: jest.fn(),
      findByTicketId: jest.fn(),
    } as unknown as jest.Mocked<IRatingRepository>;

    ticketRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    eventEmitterMock = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    useCase = new SubmitRatingUseCase(
      ratingRepositoryMock,
      ticketRepositoryMock,
      eventEmitterMock,
    );
  });

  it('should submit rating and close the ticket permanently', async () => {
    const ticket = new Ticket({
      id: 'tck-123',
      protocolNumber: 'TCK-20261105-0001',
      clientCompanyId: 'comp-123',
      customerId: 'cust-456',
      queueId: 'queue-n1',
      agentId: 'agent-789',
      status: TicketStatus.RESOLVED,
    });

    ticketRepositoryMock.findById.mockResolvedValue(ticket);
    ratingRepositoryMock.findByTicketId.mockResolvedValue(null);

    const input = {
      ticketId: 'tck-123',
      customerId: 'cust-456',
      score: 5,
      feedback: 'Suporte excelente!',
    };

    const output = await useCase.execute(input);

    expect(output.score).toBe(5);
    expect(output.feedback).toBe('Suporte excelente!');
    expect(ratingRepositoryMock.insert).toHaveBeenCalledTimes(1);
    expect(ticket.getOutput().status).toBe(TicketStatus.CLOSED);
    expect(ticketRepositoryMock.update).toHaveBeenCalledWith(ticket);
    expect(eventEmitterMock.emit).toHaveBeenCalledWith('ticket.closed', expect.any(Object));
  });

  it('should throw an error when ticket has already been rated', async () => {
    ticketRepositoryMock.findById.mockResolvedValue(
      new Ticket({
        id: 'tck-123',
        protocolNumber: 'TCK-20261105-0001',
        clientCompanyId: 'comp-123',
        customerId: 'cust-456',
        queueId: 'queue-n1',
        agentId: 'agent-789',
        status: TicketStatus.RESOLVED,
      }),
    );

    ratingRepositoryMock.findByTicketId.mockResolvedValue({ id: 'existing-rating' } as any);

    const input = {
      ticketId: 'tck-123',
      customerId: 'cust-456',
      score: 5,
    };

    await expect(useCase.execute(input)).rejects.toThrow('error.ticket_already_rated');
    expect(ratingRepositoryMock.insert).not.toHaveBeenCalled();
  });
});

