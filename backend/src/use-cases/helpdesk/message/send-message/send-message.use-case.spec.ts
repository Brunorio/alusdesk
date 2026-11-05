import { SendMessageUseCase } from './send-message.use-case';
import { IMessageRepository } from '@core/modules/helpdesk/domain/message/domain/message.repository';
import { ITicketRepository } from '@core/modules/helpdesk/domain/ticket/domain/ticket.repository';
import { Ticket } from '@core/modules/helpdesk/domain/ticket/domain/ticket';
import { TicketStatus } from '@core/modules/helpdesk/domain/ticket/enums/ticket-status.enum';
import { MessageType } from '@core/modules/helpdesk/domain/message/enums/message-type.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('SendMessageUseCase Integration Tests', () => {
  let useCase: SendMessageUseCase;
  let messageRepositoryMock: jest.Mocked<IMessageRepository>;
  let ticketRepositoryMock: jest.Mocked<ITicketRepository>;
  let eventEmitterMock: jest.Mocked<EventEmitter2>;

  beforeEach(() => {
    messageRepositoryMock = {
      insert: jest.fn(),
    } as unknown as jest.Mocked<IMessageRepository>;

    ticketRepositoryMock = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    eventEmitterMock = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    useCase = new SendMessageUseCase(
      messageRepositoryMock,
      ticketRepositoryMock,
      eventEmitterMock,
    );
  });

  it('should persist multimedia message and broadcast to ticket room when ticket is active', async () => {
    const validTicketId = 'c4f6a908-1111-4000-8000-000000000001';
    ticketRepositoryMock.findById.mockResolvedValue(
      new Ticket({
        id: validTicketId,
        organizationId: 'org-123',
        protocolNumber: 'TCK-20261105-0001',
        clientCompanyId: 'comp-123',
        requesterId: 'req-456',
        queueId: 'queue-n1',
        status: TicketStatus.IN_PROGRESS,
        agentId: 'agent-789',
      }),
    );

    const input = {
      ticketId: validTicketId,
      customerId: 'cust-456',
      type: MessageType.AUDIO,
      mediaUrl: 'https://storage.alusdesk.com/audio/voice-1.webm',
      mediaMetadata: { durationSec: 12 },
    };

    const output = await useCase.execute(input);

    expect(output.type).toBe(MessageType.AUDIO);
    expect(output.mediaUrl).toBe('https://storage.alusdesk.com/audio/voice-1.webm');
    expect(messageRepositoryMock.insert).toHaveBeenCalledTimes(1);
    expect(eventEmitterMock.emit).toHaveBeenCalledWith('chat.message_sent', output);
  });

  it('should throw an error when attempting to send a message to a CLOSED ticket', async () => {
    const validTicketId = 'c4f6a908-1111-4000-8000-000000000001';
    ticketRepositoryMock.findById.mockResolvedValue(
      new Ticket({
        id: validTicketId,
        organizationId: 'org-123',
        protocolNumber: 'TCK-20261105-0001',
        clientCompanyId: 'comp-123',
        requesterId: 'req-456',
        queueId: 'queue-n1',
        status: TicketStatus.CLOSED,
      }),
    );

    const input = {
      ticketId: validTicketId,
      customerId: 'cust-456',
      type: MessageType.TEXT,
      content: 'Mensagem tardia',
    };

    await expect(useCase.execute(input)).rejects.toThrow('error.ticket_is_closed');
    expect(messageRepositoryMock.insert).not.toHaveBeenCalled();
  });
});

