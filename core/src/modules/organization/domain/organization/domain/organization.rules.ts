import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EntityRules } from '../../../../../validators/entity-rules';

export class OrganizationRules extends EntityRules {
  @IsString()
  @IsNotEmpty({ message: 'error.organization_name_required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'error.organization_document_required' })
  documentNumber: string;

  @IsNumber()
  @Min(1)
  maxConcurrentTickets: number;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }
}
