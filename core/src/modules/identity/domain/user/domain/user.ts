import { Entity } from '../../../../../domain/entity';
import Input from '../../../../../domain/input';
import Output from '../../../../../domain/output';
import { UserId } from './user.id';
import { UserRole, UserRules, UserStatus } from './user.rules';

export interface UserInput extends Input {
  organizationId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status?: UserStatus;
}

export interface UserOutput extends Output {
  organizationId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
}

export * from './user.id';
export * from './user.rules';

export class User extends Entity {
  private readonly id: UserId;
  private readonly organizationId: string;
  private name: string;
  private email: string;
  private passwordHash: string;
  private role: UserRole;
  private status: UserStatus;

  constructor(input: UserInput) {
    super(input);
    this.id = input.id ? new UserId(input.id) : new UserId();
    this.organizationId = input.organizationId;
    this.name = input.name;
    this.email = input.email;
    this.passwordHash = input.passwordHash;
    this.role = input.role;
    this.status = input.status ?? UserStatus.OFFLINE;

    this.validate(new UserRules(this.getOutput()));
  }

  public getId(): UserId {
    return this.id;
  }

  public getOrganizationId(): string {
    return this.organizationId;
  }

  public updateStatus(status: UserStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public getOutput(): UserOutput {
    return {
      id: this.id.id,
      organizationId: this.organizationId,
      name: this.name,
      email: this.email,
      passwordHash: this.passwordHash,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

