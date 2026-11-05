import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EntityRules } from '../../../../../validators/entity-rules';
import { TicketStatus } from '../enums/ticket-status.enum';
import { SessionType } from '../enums/session-type.enum';

export class TicketRules extends EntityRules {
  @IsString()
  @IsNotEmpty({ message: 'error.organization_id_required' })
  organizationId: string;

  @IsString()
  @IsNotEmpty({ message: 'error.protocol_number_required' })
  protocolNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'error.client_company_id_required' })
  clientCompanyId: string;

  @IsString()
  @IsNotEmpty({ message: 'error.requester_id_required' })
  requesterId: string;

  @IsString()
  @IsNotEmpty({ message: 'error.queue_id_required' })
  queueId: string;

  @IsEnum(TicketStatus)
  status: TicketStatus;

  @IsEnum(SessionType)
  activeChannel: SessionType;

  @IsString()
  @IsOptional()
  agentId?: string;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }
}

