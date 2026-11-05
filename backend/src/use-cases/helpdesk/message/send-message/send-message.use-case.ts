import { Injectable } from '@nestjs/common';
import { IUseCase } from '@core/use-cases/use-case.interface';
import { IMessageRepository } from '@core/modules/helpdesk/domain/message/domain/message.repository';
import { ITicketRepository } from '@core/modules/helpdesk/domain/ticket/domain/ticket.repository';
import { Message, MessageOutput } from '@core/modules/helpdesk/domain/message/domain/message';
import { MessageType } from '@core/modules/helpdesk/domain/message/enums/message-type.enum';
import { TicketStatus } from '@core/modules/helpdesk/domain/ticket/enums/ticket-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface SendMessageInput {
  ticketId: string;
  senderType?: 'AGENT' | 'REQUESTER' | 'SYSTEM';
  userId?: string;
  customerId?: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaMetadata?: Record<string, any>;
}

@Injectable()
export class SendMessageUseCase implements IUseCase<SendMessageInput, MessageOutput> {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly ticketRepository: ITicketRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: SendMessageInput): Promise<MessageOutput> {
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      throw new Error('error.ticket_not_found');
    }

    const ticketOutput = ticket.getOutput();
    if (ticketOutput.status === TicketStatus.CLOSED || ticketOutput.status === TicketStatus.CANCELLED) {
      throw new Error('error.ticket_is_closed');
    }

    const message = new Message(input);
    await this.messageRepository.insert(message);
    const output = message.getOutput();

    this.eventEmitter.emit('chat.message_sent', output);

    return output;
  }
}
