import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SearchParams } from '../../../../../../repository/search-params';
import { SearchResult } from '../../../../../../repository/search-result';
import { organizationsTable } from '../../../../../../database/schema/manager.schema';
import { Organization, OrganizationId } from '../../domain/organization';
import { IOrganizationRepository } from '../../domain/organization.repository';
import { OrganizationModelMapper } from './organization-model.mapper';

export class DrizzleOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async insert(entity: Organization): Promise<void> {
    const row = OrganizationModelMapper.toModel(entity);
    await this.db.insert(organizationsTable).values(row);
  }

  async bulkInsert(entities: Organization[]): Promise<void> {
    if (entities.length === 0) return;
    const rows = entities.map(OrganizationModelMapper.toModel);
    await this.db.insert(organizationsTable).values(rows);
  }

  async findById(id: OrganizationId | string): Promise<Organization | undefined | null> {
    const stringId = typeof id === 'string' ? id : id.id;
    const rows = await this.db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, stringId))
      .limit(1);

    if (!rows[0]) return null;
    return OrganizationModelMapper.toEntity(rows[0]);
  }

  async findByDocumentNumber(documentNumber: string): Promise<Organization | null | undefined> {
    const rows = await this.db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.documentNumber, documentNumber))
      .limit(1);

    if (!rows[0]) return null;
    return OrganizationModelMapper.toEntity(rows[0]);
  }

  async findAll(): Promise<Organization[]> {
    const rows = await this.db.select().from(organizationsTable);
    return rows.map(OrganizationModelMapper.toEntity);
  }

  async update(entity: Organization): Promise<void> {
    const row = OrganizationModelMapper.toModel(entity);
    await this.db
      .update(organizationsTable)
      .set({
        name: row.name,
        documentNumber: row.documentNumber,
        maxConcurrentTickets: row.maxConcurrentTickets,
        isActive: row.isActive,
        connection: row.connection,
        updatedAt: new Date(),
      })
      .where(eq(organizationsTable.id, row.id));
  }

  async delete(id: OrganizationId | string): Promise<void> {
    const stringId = typeof id === 'string' ? id : id.id;
    await this.db.delete(organizationsTable).where(eq(organizationsTable.id, stringId));
  }

  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(organizationsTable);
    return Number(result[0]?.count ?? 0);
  }

  async search(props: SearchParams): Promise<SearchResult<Organization>> {
    const page = props.page;
    const perPage = props.perPage;
    const offset = (page - 1) * perPage;

    const whereClause = props.filter
      ? ilike(organizationsTable.name, `%${props.filter}%`)
      : undefined;

    const orderByClause = props.sort
      ? props.sortDir === 'desc'
        ? desc((organizationsTable as any)[props.sort] ?? organizationsTable.createdAt)
        : asc((organizationsTable as any)[props.sort] ?? organizationsTable.createdAt)
      : desc(organizationsTable.createdAt);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(organizationsTable)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(perPage)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(organizationsTable)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return new SearchResult<Organization>({
      items: rows.map(OrganizationModelMapper.toEntity),
      total,
      currentPage: page,
      perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }
}

