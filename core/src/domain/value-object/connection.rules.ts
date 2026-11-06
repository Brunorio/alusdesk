import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EntityRules } from '../../validators/entity-rules';

export class ConnectionRules extends EntityRules {
  @IsString()
  @IsNotEmpty({ message: 'error.connection_host_required' })
  host: string;

  @IsNumber()
  @Min(1, { message: 'error.connection_port_invalid' })
  port: number;

  @IsString()
  @IsNotEmpty({ message: 'error.connection_database_required' })
  database: string;

  @IsString()
  @IsNotEmpty({ message: 'error.connection_username_required' })
  username: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  schema?: string;

  @IsBoolean()
  @IsOptional()
  ssl?: boolean;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }
}

