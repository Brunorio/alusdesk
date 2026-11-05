import { Ticket, TicketId } from './ticket';
import { TicketStatus } from '../enums/ticket-status.enum';
import { SessionType } from '../enums/session-type.enum';

describe('Ticket Domain Unit Tests', () => {
  const baseTicketInput = {
    organizationId: 'org-123',
    protocolNumber: 'TCK-20261105-0001',
    clientCompanyId: 'comp-456',
    requesterId: 'req-789',
    queueId: 'queue-n1',
  };

  it('should initialize a ticket with WAITING_QUEUE status and default CHAT_ONLY channel', () => {
    const ticket = new Ticket(baseTicketInput);

    expect(ticket).toBeInstanceOf(Ticket);
    expect(ticket.getId()).toBeInstanceOf(TicketId);

    const output = ticket.getOutput();
    expect(output.organizationId).toBe('org-123');
    expect(output.protocolNumber).toBe('TCK-20261105-0001');
    expect(output.status).toBe(TicketStatus.WAITING_QUEUE);
    expect(output.activeChannel).toBe(SessionType.CHAT_ONLY);
    expect(output.enteredQueueAt).toBeInstanceOf(Date);
    expect(output.claimedAt).toBeUndefined();
    expect(output.agentId).toBeUndefined();
  });

  it('should allow an agent to claim the ticket and calculate queue wait time', () => {
    const pastDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const ticket = new Ticket({
      ...baseTicketInput,
      enteredQueueAt: pastDate,
    });

    ticket.claim('agent-789');

    const output = ticket.getOutput();
    expect(output.status).toBe(TicketStatus.IN_PROGRESS);
    expect(output.agentId).toBe('agent-789');
    expect(output.claimedAt).toBeInstanceOf(Date);
    expect(output.queueWaitTimeSec).toBeGreaterThanOrEqual(30);
  });

  it('should throw an error when claiming a ticket that is not in WAITING_QUEUE status', () => {
    const ticket = new Ticket(baseTicketInput);
    ticket.claim('agent-001');

    expect(() => {
      ticket.claim('agent-002');
    }).toThrow('error.ticket_already_claimed_or_processed');
  });

  it('should allow switching media channel during an active ticket', () => {
    const ticket = new Ticket(baseTicketInput);
    ticket.claim('agent-789');

    ticket.switchChannel(SessionType.REMOTE_CONTROL);

    expect(ticket.getOutput().activeChannel).toBe(SessionType.REMOTE_CONTROL);
  });

  it('should throw an error when switching channel on a ticket not in progress', () => {
    const ticket = new Ticket(baseTicketInput);

    expect(() => {
      ticket.switchChannel(SessionType.VOICE_CALL);
    }).toThrow('error.ticket_not_in_progress');
  });

  it('should resolve a ticket and calculate total duration', () => {
    const claimedDate = new Date(Date.now() - 60 * 1000); // 60 seconds ago
    const ticket = new Ticket({
      ...baseTicketInput,
      status: TicketStatus.IN_PROGRESS,
      agentId: 'agent-789',
      claimedAt: claimedDate,
    });

    ticket.resolve();

    const output = ticket.getOutput();
    expect(output.status).toBe(TicketStatus.RESOLVED);
    expect(output.resolvedAt).toBeInstanceOf(Date);
    expect(output.totalDurationSec).toBeGreaterThanOrEqual(60);
  });

  it('should close a resolved ticket permanently', () => {
    const ticket = new Ticket({
      ...baseTicketInput,
      status: TicketStatus.RESOLVED,
      agentId: 'agent-789',
    });

    ticket.close();

    const output = ticket.getOutput();
    expect(output.status).toBe(TicketStatus.CLOSED);
    expect(output.closedAt).toBeInstanceOf(Date);
  });

  it('should throw an error when attempting invalid transitions from CLOSED state', () => {
    const ticket = new Ticket({
      ...baseTicketInput,
      status: TicketStatus.CLOSED,
      closedAt: new Date(),
    });

    expect(() => {
      ticket.claim('agent-001');
    }).toThrow();

    expect(() => {
      ticket.resolve();
    }).toThrow();
  });
});
