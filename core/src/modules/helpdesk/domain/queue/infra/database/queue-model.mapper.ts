import { Queue } from '../../domain/queue';
import { QueueRow } from '../../../../../../database/schema/tenant.schema';

export class QueueModelMapper {
  static toEntity(row: QueueRow): Queue {
    return new Queue({
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      priority: row.priority,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? undefined,
    });
  }

  static toModel(entity: Queue): QueueRow {
    const output = entity.getOutput();
    return {
      id: output.id,
      organizationId: output.organizationId,
      name: output.name,
      priority: output.priority,
      isActive: output.isActive,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt ?? null,
    };
  }
}

