import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SearchParams } from '../../../../../../repository/search-params';
import { SearchResult } from '../../../../../../repository/search-result';
import { usersTable } from '../../../../../../database/schema/manager.schema';
import { User, UserId } from '../../domain/user';
import { IUserRepository } from '../../domain/user.repository';
import { UserModelMapper } from './user-model.mapper';

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async insert(entity: User): Promise<void> {
    const row = UserModelMapper.toModel(entity);
    await this.db.insert(usersTable).values(row);
  }

  async bulkInsert(entities: User[]): Promise<void> {
    if (entities.length === 0) return;
    const rows = entities.map(UserModelMapper.toModel);
    await this.db.insert(usersTable).values(rows);
  }

  async findById(id: UserId | string): Promise<User | undefined | null> {
    const stringId = typeof id === 'string' ? id : id.id;
    const rows = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, stringId))
      .limit(1);

    if (!rows[0]) return null;
    return UserModelMapper.toEntity(rows[0]);
  }

  async findByEmail(email: string): Promise<User | null | undefined> {
    const rows = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!rows[0]) return null;
    return UserModelMapper.toEntity(rows[0]);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db.select().from(usersTable);
    return rows.map(UserModelMapper.toEntity);
  }

  async update(entity: User): Promise<void> {
    const row = UserModelMapper.toModel(entity);
    await this.db
      .update(usersTable)
      .set({
        name: row.name,
        email: row.email,
        passwordHash: row.passwordHash,
        role: row.role,
        status: row.status,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, row.id));
  }

  async delete(id: UserId | string): Promise<void> {
    const stringId = typeof id === 'string' ? id : id.id;
    await this.db.delete(usersTable).where(eq(usersTable.id, stringId));
  }

  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(usersTable);
    return Number(result[0]?.count ?? 0);
  }

  async search(props: SearchParams): Promise<SearchResult<User>> {
    const page = props.page;
    const perPage = props.perPage;
    const offset = (page - 1) * perPage;

    const whereClause = props.filter
      ? ilike(usersTable.name, `%${props.filter}%`)
      : undefined;

    const orderByClause = props.sort
      ? props.sortDir === 'desc'
        ? desc((usersTable as any)[props.sort] ?? usersTable.createdAt)
        : asc((usersTable as any)[props.sort] ?? usersTable.createdAt)
      : desc(usersTable.createdAt);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(usersTable)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(perPage)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(usersTable)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return new SearchResult<User>({
      items: rows.map(UserModelMapper.toEntity),
      total,
      currentPage: page,
      perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }
}

