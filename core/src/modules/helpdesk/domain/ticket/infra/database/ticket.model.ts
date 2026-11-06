import { and, asc, count, desc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SearchParams } from '../../../../../../repository/search-params';
import { SearchResult } from '../../../../../../repository/search-result';
import { ticketsTable } from '../../../../../../database/schema/tenant.schema';
import { Ticket, TicketId } from '../../domain/ticket';
import { ITicketRepository } from '../../domain/ticket.repository';
import { TicketStatus } from '../../enums/ticket-status.enum';
import { TicketModelMapper } from './ticket-model.mapper';

export class DrizzleTicketRepository implements ITicketRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async insert(entity: Ticket): Promise<void> {
    const row = TicketModelMapper.toModel(entity);
    await this.db.insert(ticketsTable).values(row);
  }

  async bulkInsert(entities: Ticket[]): Promise<void> {
    if (entities.length === 0) return;
    const rows = entities.map(TicketModelMapper.toModel);
    await this.db.insert(ticketsTable).values(rows);
  }

  async findById(id: TicketId | string): Promise<Ticket | undefined | null> {
    const stringId = typeof id === 'string' ? id : id.id;
    const rows = await this.db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, stringId))
      .limit(1);

    if (!rows[0]) return null;
    return TicketModelMapper.toEntity(rows[0]);
  }

  async findByProtocol(organizationId: string, protocol: string): Promise<Ticket | null | undefined> {
    const rows = await this.db
      .select()
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.organizationId, organizationId),
          eq(ticketsTable.protocolNumber, protocol),
        ),
      )
      .limit(1);

    if (!rows[0]) return null;
    return TicketModelMapper.toEntity(rows[0]);
  }

  async countActiveSessionsByOrganization(organizationId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.organizationId, organizationId),
          inArray(ticketsTable.status, [TicketStatus.WAITING_QUEUE, TicketStatus.IN_PROGRESS]),
        ),
      );

    return Number(result[0]?.count ?? 0);
  }

  async countActiveSessionsByCompany(clientCompanyId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.clientCompanyId, clientCompanyId),
          inArray(ticketsTable.status, [TicketStatus.WAITING_QUEUE, TicketStatus.IN_PROGRESS]),
        ),
      );

    return Number(result[0]?.count ?? 0);
  }

  async generateProtocolNumber(organizationId: string): Promise<string> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    return `TCK-${dateStr}-${randomHex}`;
  }

  async claimTicketAtomically(ticketId: TicketId, agentId: string): Promise<Ticket> {
    const now = new Date();
    const updatedRows = await this.db
      .update(ticketsTable)
      .set({
        agentId,
        status: TicketStatus.IN_PROGRESS,
        claimedAt: now,
        queueWaitTimeSec: sql`EXTRACT(EPOCH FROM (${now} - ${ticketsTable.enteredQueueAt}))::int`,
        updatedAt: now,
      })
      .where(
        and(
          eq(ticketsTable.id, ticketId.id),
          eq(ticketsTable.status, TicketStatus.WAITING_QUEUE),
        ),
      )
      .returning();

    if (!updatedRows[0]) {
      throw new Error('error.ticket_already_claimed_or_processed');
    }

    return TicketModelMapper.toEntity(updatedRows[0]);
  }

  async findAll(): Promise<Ticket[]> {
    const rows = await this.db.select().from(ticketsTable);
    return rows.map(TicketModelMapper.toEntity);
  }

  async update(entity: Ticket): Promise<void> {
    const row = TicketModelMapper.toModel(entity);
    await this.db
      .update(ticketsTable)
      .set({
        agentId: row.agentId,
        status: row.status,
        activeChannel: row.activeChannel,
        claimedAt: row.claimedAt,
        resolvedAt: row.resolvedAt,
        closedAt: row.closedAt,
        queueWaitTimeSec: row.queueWaitTimeSec,
        totalDurationSec: row.totalDurationSec,
        updatedAt: new Date(),
      })
      .where(eq(ticketsTable.id, row.id));
  }

  async delete(id: TicketId | string): Promise<void> {
    const stringId = typeof id === 'string' ? id : id.id;
    await this.db.delete(ticketsTable).where(eq(ticketsTable.id, stringId));
  }

  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(ticketsTable);
    return Number(result[0]?.count ?? 0);
  }

  async search(props: SearchParams): Promise<SearchResult<Ticket>> {
    const page = props.page;
    const perPage = props.perPage;
    const offset = (page - 1) * perPage;

    const whereClause = props.filter
      ? ilike(ticketsTable.protocolNumber, `%${props.filter}%`)
      : undefined;

    const orderByClause = props.sort
      ? props.sortDir === 'desc'
        ? desc((ticketsTable as any)[props.sort] ?? ticketsTable.createdAt)
        : asc((ticketsTable as any)[props.sort] ?? ticketsTable.createdAt)
      : desc(ticketsTable.createdAt);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(ticketsTable)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(perPage)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(ticketsTable)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return new SearchResult<Ticket>({
      items: rows.map(TicketModelMapper.toEntity),
      total,
      currentPage: page,
      perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }
}

