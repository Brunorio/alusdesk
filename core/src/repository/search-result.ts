import { Entity } from '../domain/entity';

export interface SearchResultProps<E> {
  items: E[];
  total: number;
  currentPage: number;
  perPage: number;
  sort?: string | null;
  sortDir?: string | null;
  filter?: any | null;
}

export class SearchResult<E = Entity> {
  readonly items: E[];
  readonly total: number;
  readonly currentPage: number;
  readonly perPage: number;
  readonly lastPage: number;
  readonly sort: string | null;
  readonly sortDir: string | null;
  readonly filter: any | null;

  constructor(props: SearchResultProps<E>) {
    this.items = props.items;
    this.total = props.total;
    this.currentPage = props.currentPage;
    this.perPage = props.perPage;
    this.lastPage = Math.ceil(this.total / this.perPage) || 1;
    this.sort = props.sort ?? null;
    this.sortDir = props.sortDir ?? null;
    this.filter = props.filter ?? null;
  }

  toJSON() {
    return {
      items: this.items,
      total: this.total,
      currentPage: this.currentPage,
      perPage: this.perPage,
      lastPage: this.lastPage,
      sort: this.sort,
      sortDir: this.sortDir,
      filter: this.filter,
    };
  }
}

