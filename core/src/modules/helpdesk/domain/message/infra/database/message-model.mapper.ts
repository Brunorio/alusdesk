import { Message } from '../../domain/message';
import { MessageRow } from '../../../../../../database/schema/tenant.schema';
import { MessageType } from '../../enums/message-type.enum';

export class MessageModelMapper {
  static toEntity(row: MessageRow): Message {
    return new Message({
      id: row.id,
      ticketId: row.ticketId,
      senderType: row.senderType as any,
      userId: row.senderType === 'AGENT' ? row.senderId : undefined,
      customerId: row.senderType === 'REQUESTER' ? row.senderId : undefined,
      type: row.type as MessageType,
      content: row.content,
      mediaUrl: row.mediaUrl ?? undefined,
      mediaMetadata: (row.metadata as Record<string, any>) ?? undefined,
      createdAt: row.createdAt,
    });
  }

  static toModel(entity: Message): MessageRow {
    const output = entity.getOutput();
    return {
      id: output.id,
      ticketId: output.ticketId,
      senderId: output.userId ?? output.customerId ?? output.id,
      senderType: output.senderType ?? 'SYSTEM',
      type: output.type,
      content: output.content ?? '',
      mediaUrl: output.mediaUrl ?? null,
      metadata: output.mediaMetadata ?? null,
      createdAt: output.createdAt,
    };
  }
}

