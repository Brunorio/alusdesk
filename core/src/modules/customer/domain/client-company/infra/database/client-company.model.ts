import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SearchParams } from '../../../../../../repository/search-params';
import { SearchResult } from '../../../../../../repository/search-result';
import { clientCompaniesTable } from '../../../../../../database/schema/tenant.schema';
import { ClientCompany, ClientCompanyId } from '../../domain/client-company';
import { IClientCompanyRepository } from '../../domain/client-company.repository';
import { ClientCompanyModelMapper } from './client-company-model.mapper';

export class DrizzleClientCompanyRepository implements IClientCompanyRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async insert(entity: ClientCompany): Promise<void> {
    const row = ClientCompanyModelMapper.toModel(entity);
    await this.db.insert(clientCompaniesTable).values(row);
  }

  async bulkInsert(entities: ClientCompany[]): Promise<void> {
    if (entities.length === 0) return;
    const rows = entities.map(ClientCompanyModelMapper.toModel);
    await this.db.insert(clientCompaniesTable).values(rows);
  }

  async findById(id: ClientCompanyId | string): Promise<ClientCompany | undefined | null> {
    const stringId = typeof id === 'string' ? id : id.id;
    const rows = await this.db
      .select()
      .from(clientCompaniesTable)
      .where(eq(clientCompaniesTable.id, stringId))
      .limit(1);

    if (!rows[0]) return null;
    return ClientCompanyModelMapper.toEntity(rows[0]);
  }

  async findByDocumentNumber(
    organizationId: string,
    documentNumber: string,
  ): Promise<ClientCompany | null | undefined> {
    const rows = await this.db
      .select()
      .from(clientCompaniesTable)
      .where(
        and(
          eq(clientCompaniesTable.organizationId, organizationId),
          eq(clientCompaniesTable.documentNumber, documentNumber),
        ),
      )
      .limit(1);

    if (!rows[0]) return null;
    return ClientCompanyModelMapper.toEntity(rows[0]);
  }

  async findAll(): Promise<ClientCompany[]> {
    const rows = await this.db.select().from(clientCompaniesTable);
    return rows.map(ClientCompanyModelMapper.toEntity);
  }

  async update(entity: ClientCompany): Promise<void> {
    const row = ClientCompanyModelMapper.toModel(entity);
    await this.db
      .update(clientCompaniesTable)
      .set({
        corporateName: row.corporateName,
        tradeName: row.tradeName,
        documentNumber: row.documentNumber,
        maxConcurrentSessions: row.maxConcurrentSessions,
        isActive: row.isActive,
        licenseExpiresAt: row.licenseExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(clientCompaniesTable.id, row.id));
  }

  async delete(id: ClientCompanyId | string): Promise<void> {
    const stringId = typeof id === 'string' ? id : id.id;
    await this.db.delete(clientCompaniesTable).where(eq(clientCompaniesTable.id, stringId));
  }

  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(clientCompaniesTable);
    return Number(result[0]?.count ?? 0);
  }

  async search(props: SearchParams): Promise<SearchResult<ClientCompany>> {
    const page = props.page;
    const perPage = props.perPage;
    const offset = (page - 1) * perPage;

    const whereClause = props.filter
      ? ilike(clientCompaniesTable.corporateName, `%${props.filter}%`)
      : undefined;

    const orderByClause = props.sort
      ? props.sortDir === 'desc'
        ? desc((clientCompaniesTable as any)[props.sort] ?? clientCompaniesTable.createdAt)
        : asc((clientCompaniesTable as any)[props.sort] ?? clientCompaniesTable.createdAt)
      : desc(clientCompaniesTable.createdAt);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(clientCompaniesTable)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(perPage)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(clientCompaniesTable)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return new SearchResult<ClientCompany>({
      items: rows.map(ClientCompanyModelMapper.toEntity),
      total,
      currentPage: page,
      perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }
}

