import { Entity } from '../domain/entity';
import { ValueObject } from '../domain/value-object/value-object';
import { SearchParams } from './search-params';
import { SearchResult } from './search-result';
import Output from '../domain/output';

export interface IRepository<
  A extends Entity,
  ID extends ValueObject,
  SearchOutput = SearchResult<Output>,
> {
  insert(entity: A): Promise<void>;
  bulkInsert(entities: A[]): Promise<void>;
  findById(id: ID | string): Promise<A | undefined | null>;
  findAll(): Promise<A[]>;
  update(entity: A): Promise<void>;
  delete(id: ID | string): Promise<void>;
  search(props: SearchParams): Promise<SearchOutput>;
  count(): Promise<number>;
}

export interface ISearchableRepository<
  A extends Entity,
  EntityId extends ValueObject,
  SearchOutput = SearchResult<A>,
> extends IRepository<A, EntityId, SearchOutput> {}
