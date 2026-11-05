import { Entity } from '../../../../../domain/entity';
import Input from '../../../../../domain/input';
import Output from '../../../../../domain/output';
import { MessageId } from './message.id';
import { MessageRules } from './message.rules';
import { MessageType } from '../enums/message-type.enum';

export interface MessageInput extends Input {
  ticketId: string;
  senderType?: 'AGENT' | 'REQUESTER' | 'SYSTEM';
  userId?: string;
  customerId?: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaMetadata?: Record<string, any>;
}

export interface MessageOutput extends Output {
  ticketId: string;
  senderType?: 'AGENT' | 'REQUESTER' | 'SYSTEM';
  userId?: string;
  customerId?: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaMetadata?: Record<string, any>;
}

export * from './message.id';
export class Message extends Entity {
  private readonly id: MessageId;
  private readonly ticketId: string;
  private readonly senderType?: 'AGENT' | 'REQUESTER' | 'SYSTEM';
  private readonly userId?: string;
  private readonly customerId?: string;
  private readonly type: MessageType;
  private readonly content?: string;
  private readonly mediaUrl?: string;
  private readonly mediaMetadata?: Record<string, any>;

  constructor(input: MessageInput) {
    super(input);
    if (!input.content && !input.mediaUrl) {
      throw new Error('error.message_content_or_media_required');
    }

    this.id = input.id ? new MessageId(input.id) : new MessageId();
    this.ticketId = input.ticketId;
    this.senderType = input.senderType;
    this.userId = input.userId;
    this.customerId = input.customerId;
    this.type = input.type;
    this.content = input.content;
    this.mediaUrl = input.mediaUrl;
    this.mediaMetadata = input.mediaMetadata;

    this.validate(new MessageRules(this.getOutput()));
  }

  public getId(): MessageId {
    return this.id;
  }

  public getOutput(): MessageOutput {
    return {
      id: this.id.id,
      ticketId: this.ticketId,
      senderType: this.senderType,
      userId: this.userId,
      customerId: this.customerId,
      type: this.type,
      content: this.content,
      mediaUrl: this.mediaUrl,
      mediaMetadata: this.mediaMetadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
