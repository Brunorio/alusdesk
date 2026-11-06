import { and, asc, count, desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SearchParams } from '../../../../../../repository/search-params';
import { SearchResult } from '../../../../../../repository/search-result';
import { ratingsTable } from '../../../../../../database/schema/tenant.schema';
import { Rating, RatingId } from '../../domain/rating';
import { IRatingRepository } from '../../domain/rating.repository';
import { RatingModelMapper } from './rating-model.mapper';

export class DrizzleRatingRepository implements IRatingRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async insert(entity: Rating): Promise<void> {
    const row = RatingModelMapper.toModel(entity);
    await this.db.insert(ratingsTable).values(row);
  }

  async bulkInsert(entities: Rating[]): Promise<void> {
    if (entities.length === 0) return;
    const rows = entities.map(RatingModelMapper.toModel);
    await this.db.insert(ratingsTable).values(rows);
  }

  async findById(id: RatingId | string): Promise<Rating | undefined | null> {
    const stringId = typeof id === 'string' ? id : id.id;
    const rows = await this.db
      .select()
      .from(ratingsTable)
      .where(eq(ratingsTable.id, stringId))
      .limit(1);

    if (!rows[0]) return null;
    return RatingModelMapper.toEntity(rows[0]);
  }

  async findByTicketId(ticketId: string): Promise<Rating | null | undefined> {
    const rows = await this.db
      .select()
      .from(ratingsTable)
      .where(eq(ratingsTable.ticketId, ticketId))
      .limit(1);

    if (!rows[0]) return null;
    return RatingModelMapper.toEntity(rows[0]);
  }

  async findAll(): Promise<Rating[]> {
    const rows = await this.db.select().from(ratingsTable);
    return rows.map(RatingModelMapper.toEntity);
  }

  async update(entity: Rating): Promise<void> {
    const row = RatingModelMapper.toModel(entity);
    await this.db
      .update(ratingsTable)
      .set({
        score: row.score,
        comment: row.comment,
      })
      .where(eq(ratingsTable.id, row.id));
  }

  async delete(id: RatingId | string): Promise<void> {
    const stringId = typeof id === 'string' ? id : id.id;
    await this.db.delete(ratingsTable).where(eq(ratingsTable.id, stringId));
  }

  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(ratingsTable);
    return Number(result[0]?.count ?? 0);
  }

  async search(props: SearchParams): Promise<SearchResult<Rating>> {
    const page = props.page;
    const perPage = props.perPage;
    const offset = (page - 1) * perPage;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(ratingsTable)
        .orderBy(desc(ratingsTable.createdAt))
        .limit(perPage)
        .offset(offset),
      this.db.select({ count: count() }).from(ratingsTable),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return new SearchResult<Rating>({
      items: rows.map(RatingModelMapper.toEntity),
      total,
      currentPage: page,
      perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }
}

