import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SearchParams } from '../../../../../../repository/search-params';
import { SearchResult } from '../../../../../../repository/search-result';
import { queuesTable } from '../../../../../../database/schema/tenant.schema';
import { Queue, QueueId } from '../../domain/queue';
import { IQueueRepository } from '../../domain/queue.repository';
import { QueueModelMapper } from './queue-model.mapper';

export class DrizzleQueueRepository implements IQueueRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async insert(entity: Queue): Promise<void> {
    const row = QueueModelMapper.toModel(entity);
    await this.db.insert(queuesTable).values(row);
  }

  async bulkInsert(entities: Queue[]): Promise<void> {
    if (entities.length === 0) return;
    const rows = entities.map(QueueModelMapper.toModel);
    await this.db.insert(queuesTable).values(rows);
  }

  async findById(id: QueueId | string): Promise<Queue | undefined | null> {
    const stringId = typeof id === 'string' ? id : id.id;
    const rows = await this.db
      .select()
      .from(queuesTable)
      .where(eq(queuesTable.id, stringId))
      .limit(1);

    if (!rows[0]) return null;
    return QueueModelMapper.toEntity(rows[0]);
  }

  async findByOrganizationId(organizationId: string): Promise<Queue[]> {
    const rows = await this.db
      .select()
      .from(queuesTable)
      .where(eq(queuesTable.organizationId, organizationId));

    return rows.map(QueueModelMapper.toEntity);
  }

  async findAll(): Promise<Queue[]> {
    const rows = await this.db.select().from(queuesTable);
    return rows.map(QueueModelMapper.toEntity);
  }

  async update(entity: Queue): Promise<void> {
    const row = QueueModelMapper.toModel(entity);
    await this.db
      .update(queuesTable)
      .set({
        name: row.name,
        priority: row.priority,
        isActive: row.isActive,
        updatedAt: new Date(),
      })
      .where(eq(queuesTable.id, row.id));
  }

  async delete(id: QueueId | string): Promise<void> {
    const stringId = typeof id === 'string' ? id : id.id;
    await this.db.delete(queuesTable).where(eq(queuesTable.id, stringId));
  }

  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(queuesTable);
    return Number(result[0]?.count ?? 0);
  }

  async search(props: SearchParams): Promise<SearchResult<Queue>> {
    const page = props.page;
    const perPage = props.perPage;
    const offset = (page - 1) * perPage;

    const whereClause = props.filter
      ? ilike(queuesTable.name, `%${props.filter}%`)
      : undefined;

    const orderByClause = props.sort
      ? props.sortDir === 'desc'
        ? desc((queuesTable as any)[props.sort] ?? queuesTable.createdAt)
        : asc((queuesTable as any)[props.sort] ?? queuesTable.createdAt)
      : desc(queuesTable.createdAt);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(queuesTable)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(perPage)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(queuesTable)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return new SearchResult<Queue>({
      items: rows.map(QueueModelMapper.toEntity),
      total,
      currentPage: page,
      perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }
}

