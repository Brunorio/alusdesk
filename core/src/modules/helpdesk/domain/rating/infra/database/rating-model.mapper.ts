import { Rating } from '../../domain/rating';
import { RatingRow } from '../../../../../../database/schema/tenant.schema';

export class RatingModelMapper {
  static toEntity(row: RatingRow): Rating {
    return new Rating({
      id: row.id,
      ticketId: row.ticketId,
      customerId: row.requesterId,
      agentId: row.agentId ?? '',
      score: row.score,
      feedback: row.comment ?? undefined,
      createdAt: row.createdAt,
    });
  }

  static toModel(entity: Rating): RatingRow {
    const output = entity.getOutput();
    return {
      id: output.id,
      ticketId: output.ticketId,
      requesterId: output.customerId,
      agentId: output.agentId || null,
      score: output.score,
      comment: output.feedback ?? null,
      createdAt: output.createdAt,
    };
  }
}

