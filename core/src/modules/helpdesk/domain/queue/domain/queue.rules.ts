import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EntityRules } from '../../../../../validators/entity-rules';

export class QueueRules extends EntityRules {
  @IsString()
  @IsNotEmpty({ message: 'error.queue_organization_id_required' })
  organizationId: string;

  @IsString()
  @IsNotEmpty({ message: 'error.queue_name_required' })
  name: string;

  @IsNumber()
  @Min(1, { message: 'error.queue_priority_invalid' })
  priority: number;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }
}

