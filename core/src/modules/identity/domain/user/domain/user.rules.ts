import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EntityRules } from '../../../../../validators/entity-rules';

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  AGENT = 'AGENT',
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  BUSY = 'BUSY',
  AWAY = 'AWAY',
  OFFLINE = 'OFFLINE',
}

export class UserRules extends EntityRules {
  @IsString()
  @IsNotEmpty({ message: 'error.user_organization_id_required' })
  organizationId: string;

  @IsString()
  @IsNotEmpty({ message: 'error.user_name_required' })
  name: string;

  @IsEmail({}, { message: 'error.user_email_invalid' })
  @IsNotEmpty({ message: 'error.user_email_required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'error.user_password_hash_required' })
  passwordHash: string;

  @IsEnum(UserRole, { message: 'error.user_role_invalid' })
  role: UserRole;

  @IsEnum(UserStatus, { message: 'error.user_status_invalid' })
  @IsOptional()
  status?: UserStatus;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }
}

