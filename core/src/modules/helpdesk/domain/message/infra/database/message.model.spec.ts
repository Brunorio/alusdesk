import { Message } from '../../domain/message';
import { MessageType } from '../../enums/message-type.enum';
import { DrizzleMessageRepository } from './message.model';

describe('DrizzleMessageRepository Unit Tests', () => {
  let repository: DrizzleMessageRepository;
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
      delete: jest.fn().mockReturnThis(),
    };
    repository = new DrizzleMessageRepository(mockDb);
  });

  it('should insert a message', async () => {
    const msg = new Message({
      ticketId: '44444444-4444-4444-8444-444444444444',
      senderType: 'AGENT',
      userId: '55555555-5555-4555-8555-555555555555',
      type: MessageType.TEXT,
      content: 'Hello, how can I help you today?',
    });

    await repository.insert(msg);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Hello, how can I help you today?',
        senderType: 'AGENT',
      }),
    );
  });

  it('should find messages by ticket id', async () => {
    const validMsgId = '66666666-6666-4666-8666-666666666666';
    const row = {
      id: validMsgId,
      ticketId: '44444444-4444-4444-8444-444444444444',
      senderId: '55555555-5555-4555-8555-555555555555',
      senderType: 'AGENT',
      type: 'TEXT',
      content: 'Hello, how can I help you today?',
      mediaUrl: null,
      metadata: null,
      createdAt: new Date(),
    };
    mockDb.orderBy.mockResolvedValueOnce([row]);

    const result = await repository.findByTicketId('44444444-4444-4444-8444-444444444444');

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Message);
  });
});

