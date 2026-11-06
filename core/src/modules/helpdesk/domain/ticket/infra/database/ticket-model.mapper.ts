import { Ticket } from '../../domain/ticket';
import { TicketRow } from '../../../../../../database/schema/tenant.schema';
import { TicketStatus } from '../../enums/ticket-status.enum';
import { SessionType } from '../../enums/session-type.enum';

export class TicketModelMapper {
  static toEntity(row: TicketRow): Ticket {
    return new Ticket({
      id: row.id,
      organizationId: row.organizationId,
      protocolNumber: row.protocolNumber,
      clientCompanyId: row.clientCompanyId,
      requesterId: row.requesterId,
      queueId: row.queueId,
      agentId: row.agentId ?? undefined,
      status: row.status as TicketStatus,
      activeChannel: row.activeChannel as SessionType,
      enteredQueueAt: row.enteredQueueAt,
      claimedAt: row.claimedAt ?? undefined,
      resolvedAt: row.resolvedAt ?? undefined,
      closedAt: row.closedAt ?? undefined,
      queueWaitTimeSec: row.queueWaitTimeSec ?? undefined,
      totalDurationSec: row.totalDurationSec ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? undefined,
    });
  }

  static toModel(entity: Ticket): TicketRow {
    const output = entity.getOutput();
    return {
      id: output.id,
      organizationId: output.organizationId,
      protocolNumber: output.protocolNumber,
      clientCompanyId: output.clientCompanyId,
      requesterId: output.requesterId,
      queueId: output.queueId,
      agentId: output.agentId ?? null,
      status: output.status,
      activeChannel: output.activeChannel,
      enteredQueueAt: output.enteredQueueAt,
      claimedAt: output.claimedAt ?? null,
      resolvedAt: output.resolvedAt ?? null,
      closedAt: output.closedAt ?? null,
      queueWaitTimeSec: output.queueWaitTimeSec ?? null,
      totalDurationSec: output.totalDurationSec ?? null,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt ?? null,
    };
  }
}

