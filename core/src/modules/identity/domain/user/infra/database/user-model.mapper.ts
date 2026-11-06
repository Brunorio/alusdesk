import { User, UserRole, UserStatus } from '../../domain/user';
import { UserRow } from '../../../../../../database/schema/manager.schema';

export class UserModelMapper {
  static toEntity(row: UserRow): User {
    return new User({
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as UserRole,
      status: row.status as UserStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? undefined,
    });
  }

  static toModel(entity: User): UserRow {
    const output = entity.getOutput();
    return {
      id: output.id,
      organizationId: output.organizationId,
      name: output.name,
      email: output.email,
      passwordHash: output.passwordHash,
      role: output.role,
      status: output.status,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt ?? null,
    };
  }
}

