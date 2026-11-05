import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { EntityRules } from '../../../../../validators/entity-rules';

export class RatingRules extends EntityRules {
  @IsString()
  @IsNotEmpty({ message: 'error.ticket_id_required' })
  ticketId: string;

  @IsString()
  @IsNotEmpty({ message: 'error.customer_id_required' })
  customerId: string;

  @IsString()
  @IsNotEmpty({ message: 'error.agent_id_required' })
  agentId: string;

  @IsNumber()
  @Min(1, { message: 'error.rating_score_must_be_between_1_and_5' })
  @Max(5, { message: 'error.rating_score_must_be_between_1_and_5' })
  score: number;

  @IsString()
  @IsOptional()
  feedback?: string;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }
}

