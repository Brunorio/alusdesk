import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EntityRules } from '../../../../../validators/entity-rules';

export class ClientCompanyRules extends EntityRules {
  @IsString()
  @IsNotEmpty({ message: 'error.organization_id_required' })
  organizationId: string;

  @IsString()
  @IsNotEmpty({ message: 'error.corporate_name_required' })
  corporateName: string;

  @IsString()
  @IsNotEmpty({ message: 'error.document_number_required' })
  documentNumber: string;

  @IsNumber()
  @Min(1)
  maxConcurrentSessions: number;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }
}

