import { Ticket } from '../../domain/ticket';
import { TicketStatus } from '../../enums/ticket-status.enum';
import { DrizzleTicketRepository } from './ticket.model';

describe('DrizzleTicketRepository Unit Tests', () => {
  let repository: DrizzleTicketRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn(),
      offset: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      delete: jest.fn().mockReturnThis(),
    };
    repository = new DrizzleTicketRepository(mockDb);
  });

  it('should insert a ticket', async () => {
    const ticket = new Ticket({
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      protocolNumber: 'TCK-20261106-ABCD',
      clientCompanyId: '11111111-1111-4111-8111-111111111111',
      requesterId: '22222222-2222-4222-8222-222222222222',
      queueId: '33333333-3333-4333-8333-333333333333',
    });

    await repository.insert(ticket);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        protocolNumber: 'TCK-20261106-ABCD',
        status: TicketStatus.WAITING_QUEUE,
      }),
    );
  });

  it('should atomically claim a ticket when status is WAITING_QUEUE', async () => {
    const validTicketId = '44444444-4444-4444-8444-444444444444';
    const updatedRow = {
      id: validTicketId,
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      protocolNumber: 'TCK-20261106-ABCD',
      clientCompanyId: '11111111-1111-4111-8111-111111111111',
      requesterId: '22222222-2222-4222-8222-222222222222',
      queueId: '33333333-3333-4333-8333-333333333333',
      agentId: '55555555-5555-4555-8555-555555555555',
      status: 'IN_PROGRESS',
      activeChannel: 'CHAT_ONLY',
      enteredQueueAt: new Date(Date.now() - 60000),
      claimedAt: new Date(),
      resolvedAt: null,
      closedAt: null,
      queueWaitTimeSec: 60,
      totalDurationSec: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDb.returning.mockResolvedValueOnce([updatedRow]);

    const result = await repository.claimTicketAtomically(
      { id: validTicketId } as any,
      '55555555-5555-4555-8555-555555555555',
    );

    expect(result).toBeInstanceOf(Ticket);
    expect(result.getOutput().status).toBe(TicketStatus.IN_PROGRESS);
    expect(result.getOutput().agentId).toBe('55555555-5555-4555-8555-555555555555');
  });

  it('should throw error when atomic claim fails because ticket is already claimed', async () => {
    mockDb.returning.mockResolvedValueOnce([]);

    await expect(
      repository.claimTicketAtomically(
        { id: '44444444-4444-4444-8444-444444444444' } as any,
        '55555555-5555-4555-8555-555555555555',
      ),
    ).rejects.toThrow('error.ticket_already_claimed_or_processed');
  });
});

