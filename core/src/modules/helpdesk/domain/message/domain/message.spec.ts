import { Message, MessageId } from './message';
import { MessageType } from '../enums/message-type.enum';

describe('Message Domain Unit Tests', () => {
  const baseMessageInput = {
    ticketId: 'tck-123',
    customerId: 'cust-456',
    type: MessageType.TEXT,
    content: 'Preciso de auxílio com a impressora fiscal',
  };

  it('should create a valid text message', () => {
    const message = new Message(baseMessageInput);

    expect(message).toBeInstanceOf(Message);
    expect(message.getId()).toBeInstanceOf(MessageId);

    const output = message.getOutput();
    expect(output.type).toBe(MessageType.TEXT);
    expect(output.content).toBe('Preciso de auxílio com a impressora fiscal');
    expect(output.mediaUrl).toBeUndefined();
    expect(output.createdAt).toBeInstanceOf(Date);
  });

  it('should create a valid multimedia message with mediaUrl and metadata', () => {
    const audioMessage = new Message({
      ticketId: 'tck-123',
      customerId: 'cust-456',
      type: MessageType.AUDIO,
      mediaUrl: 'https://storage.alusdesk.com/audio/voice-note-1.webm',
      mediaMetadata: {
        durationSec: 15,
        mimeType: 'audio/webm',
        sizeBytes: 124500,
      },
    });

    const output = audioMessage.getOutput();
    expect(output.type).toBe(MessageType.AUDIO);
    expect(output.mediaUrl).toBe('https://storage.alusdesk.com/audio/voice-note-1.webm');
    expect(output.mediaMetadata?.durationSec).toBe(15);
  });

  it('should create a screen capture message', () => {
    const captureMessage = new Message({
      ticketId: 'tck-123',
      customerId: 'cust-456',
      type: MessageType.SCREEN_CAPTURE,
      mediaUrl: 'https://storage.alusdesk.com/screens/shot-123.png',
      content: 'Erro visualizado na tela ao emitir cupom',
      mediaMetadata: {
        width: 1920,
        height: 1080,
        mimeType: 'image/png',
      },
    });

    expect(captureMessage.getOutput().type).toBe(MessageType.SCREEN_CAPTURE);
  });

  it('should throw an error when message has neither content nor mediaUrl', () => {
    expect(() => {
      new Message({
        ticketId: 'tck-123',
        customerId: 'cust-456',
        type: MessageType.TEXT,
        content: '',
      });
    }).toThrow('error.message_content_or_media_required');
  });
});

