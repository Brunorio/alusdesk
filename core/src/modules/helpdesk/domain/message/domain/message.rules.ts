import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EntityRules } from '../../../../../validators/entity-rules';
import { MessageType } from '../enums/message-type.enum';

export class MessageRules extends EntityRules {
  @IsString()
  @IsNotEmpty({ message: 'error.ticket_id_required' })
  ticketId: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }
}
