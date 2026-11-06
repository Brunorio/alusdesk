import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SearchParams } from '../../../../../../repository/search-params';
import { SearchResult } from '../../../../../../repository/search-result';
import { messagesTable } from '../../../../../../database/schema/tenant.schema';
import { Message, MessageId } from '../../domain/message';
import { IMessageRepository } from '../../domain/message.repository';
import { MessageModelMapper } from './message-model.mapper';

export class DrizzleMessageRepository implements IMessageRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async insert(entity: Message): Promise<void> {
    const row = MessageModelMapper.toModel(entity);
    await this.db.insert(messagesTable).values(row);
  }

  async bulkInsert(entities: Message[]): Promise<void> {
    if (entities.length === 0) return;
    const rows = entities.map(MessageModelMapper.toModel);
    await this.db.insert(messagesTable).values(rows);
  }

  async findById(id: MessageId | string): Promise<Message | undefined | null> {
    const stringId = typeof id === 'string' ? id : id.id;
    const rows = await this.db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, stringId))
      .limit(1);

    if (!rows[0]) return null;
    return MessageModelMapper.toEntity(rows[0]);
  }

  async findByTicketId(ticketId: string): Promise<Message[]> {
    const rows = await this.db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.ticketId, ticketId))
      .orderBy(asc(messagesTable.createdAt));

    return rows.map(MessageModelMapper.toEntity);
  }

  async findAll(): Promise<Message[]> {
    const rows = await this.db.select().from(messagesTable);
    return rows.map(MessageModelMapper.toEntity);
  }

  async update(entity: Message): Promise<void> {
    const row = MessageModelMapper.toModel(entity);
    await this.db
      .update(messagesTable)
      .set({
        content: row.content,
        mediaUrl: row.mediaUrl,
        metadata: row.metadata,
      })
      .where(eq(messagesTable.id, row.id));
  }

  async delete(id: MessageId | string): Promise<void> {
    const stringId = typeof id === 'string' ? id : id.id;
    await this.db.delete(messagesTable).where(eq(messagesTable.id, stringId));
  }

  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(messagesTable);
    return Number(result[0]?.count ?? 0);
  }

  async search(props: SearchParams): Promise<SearchResult<Message>> {
    const page = props.page;
    const perPage = props.perPage;
    const offset = (page - 1) * perPage;

    const whereClause = props.filter
      ? ilike(messagesTable.content, `%${props.filter}%`)
      : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(messagesTable)
        .where(whereClause)
        .orderBy(desc(messagesTable.createdAt))
        .limit(perPage)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(messagesTable)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return new SearchResult<Message>({
      items: rows.map(MessageModelMapper.toEntity),
      total,
      currentPage: page,
      perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }
}

